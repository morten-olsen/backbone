import { type FastifyPluginAsync } from 'fastify';

const api: FastifyPluginAsync = async (fastify) => {
  fastify.get('/healthz', () => {
    return { status: 'ok' };
  });
};

export { api };
