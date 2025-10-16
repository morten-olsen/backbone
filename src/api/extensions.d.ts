import type { Session } from '#root/services/sessions/sessions.session.ts';
import type { Services } from '#root/utils/services.ts';
import 'fastify';
declare module 'fastify' {
  // eslint-disable-next-line
  export interface FastifyInstance {
    services: Services;
  }

  // eslint-disable-next-line
  export interface FastifyRequest {
    session: Session;
  }
}
