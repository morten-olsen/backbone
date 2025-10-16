import { SessionProvider } from '#root/services/sessions/sessions.provider.ts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

const authPlugin: FastifyPluginAsyncZod = async (fastify) => {
  fastify.addHook('onRequest', async (req, reply) => {
    const authProvider = req.headers['x-auth-provider'];
    if (!authProvider || Array.isArray(authProvider)) {
      throw reply.unauthorized('missing x-auth-provider header');
    }
    const authorization = req.headers.authorization;
    if (!authorization) {
      throw reply.unauthorized('missing authorization header');
    }
    const [type, token] = authorization.split(' ');
    if (type.toLowerCase() !== 'bearer') {
      throw reply.unauthorized('only bearer tokens are allowed');
    }
    if (!token) {
      throw reply.unauthorized('missing token');
    }
    const sessionProvider = fastify.services.get(SessionProvider);
    const session = await sessionProvider.get(authProvider, token);
    req.session = session;
  });
};

export { authPlugin };
