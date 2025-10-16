import { connectAsync, MqttClient } from 'mqtt';
import getPort from 'get-port';

import type { TopicDefinition } from '#root/topics/topcis.schemas.ts';
import { TopicsStore } from '#root/topics/topics.store.ts';
import { Backbone } from '#root/backbone.ts';
import { JwtAuth } from '#root/auth/auth.jwt.ts';
import type { Statement } from '#root/auth/auth.schemas.ts';

type CreateSocketOptions = {
  port: number;
  token: string;
};

const createSocket = async (options: CreateSocketOptions) => {
  const { port, token } = options;
  const mqttClient = await connectAsync(`ws://localhost:${port}/ws`, {
    username: 'token',
    password: token,
    reconnectOnConnackError: false,
  });
  return mqttClient;
};

type WorldOptions = {
  topics?: TopicDefinition[];
};

const createWorld = async (options: WorldOptions) => {
  const { topics = [] } = options;
  const backbone = new Backbone();
  const accessTokens = backbone.services.get(JwtAuth);
  backbone.sessionProvider.register('token', accessTokens);
  const topicsStore = new TopicsStore();
  topicsStore.register(...topics);
  backbone.topicsHandler.register(topicsStore);
  const server = backbone.server;
  const fastify = await server.getHttpServer();
  const port = await getPort();
  await fastify.listen({ port });
  const sockets: MqttClient[] = [];
  return {
    connect: async (...clients: Statement[][]) => {
      const newSockets = await Promise.all(
        clients.map((statements) =>
          createSocket({
            port,
            token: accessTokens.generate({
              statements,
            }),
          }),
        ),
      );
      sockets.push(...newSockets);
      return newSockets;
    },
    destroy: async () => {
      await Promise.all(sockets.map((s) => s.endAsync()));
      await fastify.close();
    },
  };
};

type World = Awaited<ReturnType<typeof createWorld>>;

export type { World };
export { createWorld };
