import tcp from 'node:net';
import type { IncomingMessage } from 'node:http';

import swagger from '@fastify/swagger';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import scalar from '@scalar/fastify-api-reference';
import {
  type AuthenticateHandler,
  type AuthorizeForwardHandler,
  type AuthorizePublishHandler,
  type AuthorizeSubscribeHandler,
  type PublishedHandler,
} from 'aedes';
import aedes from 'aedes';
import fastify, { type FastifyInstance } from 'fastify';
import fastifyWebSocket from '@fastify/websocket';
import { createWebSocketStream } from 'ws';
import fastifySensible from '@fastify/sensible';

import { api } from '../api/api.ts';

import { TopicsHandler } from '#root/topics/topics.handler.ts';
import { destroy, type Services } from '#root/utils/services.ts';
import { Session } from '#root/services/sessions/sessions.session.ts';
import { SessionProvider } from '#root/services/sessions/sessions.provider.ts';
import { Config } from '#root/config/config.ts';

type Aedes = ReturnType<typeof aedes.createBroker>;

declare module 'aedes' {
  // eslint-disable-next-line
  export interface Client {
    session: Session;
  }
}

const packetMetaSymbol = Symbol('packetMeta');

class AuthError extends Error {
  public readonly returnCode = 4;
}

class MqttServer {
  #services: Services;
  #server: Aedes;
  #http?: Promise<FastifyInstance>;
  #tcp?: tcp.Server;

  constructor(services: Services) {
    this.#services = services;
    this.#server = aedes.createBroker({
      authenticate: this.#authenticate,
      authorizePublish: this.#authorizePublish,
      authorizeSubscribe: this.#authorizeSubscribe,
      authorizeForward: this.#authorizeForward,
      published: this.#published,
    });
  }

  public get bus() {
    return this.#server;
  }

  #authenticate: AuthenticateHandler = async (client, username, password, callback) => {
    try {
      if (!username || !password) {
        throw new Error('unauthorized');
      }
      const sessionProvider = this.#services.get(SessionProvider);
      const auth = await sessionProvider.validate(username, password.toString('utf8'));
      client.session = new Session(auth);
      callback(null, true);
    } catch {
      callback(new AuthError('Unautorized'), false);
    }
  };

  #authorizePublish: AuthorizePublishHandler = (client, packet, callback) => {
    const topicsHandler = this.#services.get(TopicsHandler);
    (packet as ExplicitAny)[packetMetaSymbol] = {
      foo: 'bar',
    };
    const authorized = client?.session.validate({
      action: 'mqtt:publish',
      resource: `mqtt:${packet.topic}`,
    });
    if (!authorized) {
      return callback(new Error('unauthorized'));
    }
    if (!topicsHandler.validate(packet)) {
      return callback(new Error('rules not matched'));
    }
    callback();
  };

  #authorizeSubscribe: AuthorizeSubscribeHandler = (client, subscription, callback) => {
    const authorized = client?.session.validate({
      action: 'mqtt:subscribe',
      resource: `mqtt:${subscription.topic}`,
    });
    if (!authorized) {
      return callback(new Error('unauthorized'), null);
    }
    callback(null, subscription);
  };

  #authorizeForward: AuthorizeForwardHandler = (client, packet) => {
    const authorized = client.session.validate({
      action: 'mqtt:read',
      resource: `mqtt:${packet.topic}`,
    });
    if (!authorized) {
      return;
    }
    return packet;
  };

  #published: PublishedHandler = (_packet, _client, callback) => {
    callback();
  };

  #setupHttpServer = async () => {
    const http = fastify({});
    const config = this.#services.get(Config);
    if (config.api.enabled) {
      http.decorate('services', this.#services);
      http.setValidatorCompiler(validatorCompiler);
      http.setSerializerCompiler(serializerCompiler);
      await http.register(fastifyWebSocket);
      await http.register(fastifySensible);
      await http.register(swagger, {
        openapi: {
          info: {
            title: 'Backbone',
            version: '1.0.0',
          },
          components: {
            securitySchemes: {
              authProviderHeader: {
                type: 'apiKey',
                name: 'X-Auth-Provider',
                in: 'header',
              },
              bearerAuth: {
                type: 'http',
                scheme: 'bearer',
              },
            },
          },
          security: [{ bearerAuth: [], authProviderHeader: [] }],
        },
        transform: jsonSchemaTransform,
      });
      await http.register(scalar, {
        routePrefix: '/docs',
      });
      await http.register(api, {
        prefix: '/api',
      });
    }
    if (config.ws.enabled) {
      http.get('/ws', { websocket: true }, (socket, req) => {
        const stream = createWebSocketStream(socket);
        this.#server.handle(stream, req as unknown as IncomingMessage);
      });
    }
    await http.ready();
    http.swagger();
    return http;
  };

  public getHttpServer = () => {
    if (!this.#http) {
      this.#http = this.#setupHttpServer();
    }
    return this.#http;
  };

  public getTcpServer = () => {
    if (!this.#tcp) {
      this.#tcp = tcp.createServer(this.#server.handle);
    }
    return this.#tcp;
  };

  [destroy] = async () => {
    if (this.#http) {
      const http = await this.#http;
      await http.close();
    }
    await new Promise<void>((resolve, reject) => {
      if (this.#tcp) {
        this.#tcp.close((err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  };
}

export { MqttServer };
