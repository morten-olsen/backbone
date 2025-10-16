import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { Config } from '#root/config/config.ts';
import { MqttServer } from '#root/server/server.ts';

const messageEndpoints: FastifyPluginAsyncZod = async (fastify) => {
  const config = fastify.services.get(Config);

  if (config.jwtSecret) {
    fastify.route({
      method: 'post',
      url: '',
      schema: {
        summary: 'Post a message to the bus',
        operationId: 'message.post',
        tags: ['message'],
        body: z.object({
          topic: z.string(),
          dup: z.boolean(),
          qos: z.union([z.literal(0), z.literal(1), z.literal(2)]),
          retain: z.boolean(),
          payload: z.string(),
        }),
        response: {
          200: z.object({
            success: z.literal(true),
          }),
        },
      },
      handler: async (req, reply) => {
        if (
          !req.session.validate({
            action: 'mqtt:publish',
            resource: 'mgmt:',
          })
        ) {
          throw reply.unauthorized('not allowed');
        }
        const server = fastify.services.get(MqttServer);

        await new Promise<void>((resolve, reject) => {
          server.bus.publish(
            {
              ...req.body,
              cmd: 'publish',
              payload: Buffer.from(req.body.payload, 'base64'),
            },
            (err) => {
              if (err) {
                return reject(err);
              }
              resolve();
            },
          );
        });
        reply.send({ success: true });
      },
    });
  }
};

export { messageEndpoints };
