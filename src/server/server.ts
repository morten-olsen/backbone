import tcp from 'node:net';
import type { IncomingMessage } from 'node:http';

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

import { Session } from '../access/access.session.ts';
import { api } from '../api/api.ts';

import type { AccessHandler } from '#root/access/access.handler.ts';
import type { TopicsHandler } from '#root/topics/topics.handler.ts';

type Aedes = ReturnType<typeof aedes.createBroker>;

declare module 'aedes' {
  // eslint-disable-next-line
  export interface Client {
    session: Session;
  }
}

const packetMetaSymbol = Symbol('packetMeta');

type MqttServerOptions = {
  accessHandler: AccessHandler;
  topicsHandler: TopicsHandler;
};

class AuthError extends Error {
  public readonly returnCode = 4;
}

class MqttServer {
  #options: MqttServerOptions;
  #server: Aedes;
  #http?: Promise<FastifyInstance>;
  #tcp?: tcp.Server;

  constructor(options: MqttServerOptions) {
    this.#options = options;
    this.#server = aedes.createBroker({
      authenticate: this.#authenticate,
      authorizePublish: this.#authorizePublish,
      authorizeSubscribe: this.#authorizeSubscribe,
      authorizeForward: this.#authorizeForward,
      published: this.#published,
    });
  }

  #authenticate: AuthenticateHandler = async (client, username, password, callback) => {
    try {
      if (!username || !password) {
        throw new Error('unauthorized');
      }
      const { accessHandler } = this.#options;
      const auth = await accessHandler.validate(username, password.toString('utf8'));
      client.session = new Session(auth);
      callback(null, true);
    } catch {
      callback(new AuthError('Unautorized'), false);
    }
  };

  #authorizePublish: AuthorizePublishHandler = (client, packet, callback) => {
    const { topicsHandler } = this.#options;
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
    await http.register(fastifyWebSocket);
    http.get('/ws', { websocket: true }, (socket, req) => {
      const stream = createWebSocketStream(socket);
      this.#server.handle(stream, req as unknown as IncomingMessage);
    });
    await http.register(api, {
      prefix: '/api',
    });
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
}

export { MqttServer };
