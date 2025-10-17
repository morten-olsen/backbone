import { type FastifyPluginAsync } from 'fastify';

import { manageEndpoints } from './endpoints/endpoints.manage.ts';
import { authPlugin } from './plugins/plugins.auth.ts';
import { messageEndpoints } from './endpoints/endpoints.message.ts';

const api: FastifyPluginAsync = async (app) => {
  await authPlugin(app, {});

  await app.register(manageEndpoints, {
    prefix: '/manage',
  });
  await app.register(messageEndpoints, {
    prefix: '/message',
  });
};

export { api };
