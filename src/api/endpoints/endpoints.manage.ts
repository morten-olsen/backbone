import { JwtAuth } from '#root/auth/auth.jwt.ts';
import { statementSchema } from '#root/auth/auth.schemas.ts';
import { Config } from '#root/config/config.ts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

const manageEndpoints: FastifyPluginAsyncZod = async (fastify) => {
  const config = fastify.services.get(Config);

  if (config.jwtSecret) {
    fastify.route({
      method: 'post',
      url: '/jwt',
      schema: {
        operationId: 'manage.jwt.post',
        summary: 'Generate a JWT',
        tags: ['manage'],
        body: z.object({
          exp: z.number().optional(),
          statements: z.array(statementSchema),
        }),
        response: {
          200: z.object({
            jwt: z.string(),
          }),
        },
      },
      handler: async (req, reply) => {
        if (
          !req.session.validate({
            action: 'mgmt:generate-jwt',
            resource: 'mgmt/',
          })
        ) {
          throw reply.unauthorized('not allowed');
        }
        const jwtAuth = fastify.services.get(JwtAuth);
        const jwt = jwtAuth.generate(req.body);
        reply.send({ jwt });
      },
    });
  }
};

export { manageEndpoints };
