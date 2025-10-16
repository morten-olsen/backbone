import { type FastifyPluginAsync } from 'fastify';
import { manageEndpoints } from './endpoints/endpoints.manage.ts';
import { authPlugin } from './plugins/plugins.auth.ts';
import { messageEndpoints } from './endpoints/endpoints.message.ts';
import { z } from 'zod';

const api: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: 'get',
    url: '/health',
    schema: {
      operationId: 'health.get',
      summary: 'Get health status',
      tags: ['system'],
      response: {
        200: z.object({
          status: z.literal('ok'),
        }),
      },
    },
    handler: () => {
      return { status: 'ok' };
    },
  });
  await authPlugin(fastify, {});

  await fastify.register(manageEndpoints, {
    prefix: '/manage',
  });
  await fastify.register(messageEndpoints, {
    prefix: '/message',
  });
};

export { api };
