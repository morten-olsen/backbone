import http from 'node:http';
import tcp from 'node:net';
import { WebSocketServer, createWebSocketStream } from 'ws';
import {
  createBroker,
  type AuthenticateHandler,
  type AuthorizeForwardHandler,
  type AuthorizePublishHandler,
  type AuthorizeSubscribeHandler,
  type PublishedHandler,
} from 'aedes';
import { AedesMemoryPersistence } from 'aedes-persistence';
import { Session } from '../access/access.session.ts';
import type { AccessTokens } from '#root/access/access.token.ts';

type Aedes = ReturnType<typeof createBroker>;

declare module 'aedes' {
  export interface Client {
    session: Session;
  }
}

type MqttServerOptions = {
  accessTokens: AccessTokens;
};

class MqttServer {
  #options: MqttServerOptions;
  #server: Aedes;
  #http?: http.Server;
  #tcp?: tcp.Server;

  constructor(options: MqttServerOptions) {
    this.#options = options;
    this.#server = createBroker({
      persistence: new AedesMemoryPersistence(),
      authenticate: this.#authenticate,
      authorizePublish: this.#authorizePublish,
      authorizeSubscribe: this.#authorizeSubscribe,
      authorizeForward: this.#authorizeForward,
      published: this.#published,
    });
  }

  #authenticate: AuthenticateHandler = (client, _username, password, callback) => {
    if (!password) {
      throw new Error('unauthorized');
    }
    const { accessTokens } = this.#options;
    const auth = accessTokens.validate(password.toString('utf8'));
    client.session = new Session({
      statements: auth.statements,
    });
    callback(null, true);
  };

  #authorizePublish: AuthorizePublishHandler = (client, packet, callback) => {
    const authorized = client?.session.validate({
      action: 'mqtt:publish',
      resource: `mqtt:${packet.topic}`,
    });
    if (!authorized) {
      return callback(new Error('unauthorized'));
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
      action: 'mqtt:forward',
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

  public getHttpServer = () => {
    if (!this.#http) {
      this.#http = http.createServer();
      const wss = new WebSocketServer({
        server: this.#http,
      });
      wss.on('connection', (websocket, req) => {
        const stream = createWebSocketStream(websocket);
        this.#server.handle(stream, req);
      });
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
