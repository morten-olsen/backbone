import type { Services } from '#root/utils/services.ts';
import { Config } from '#root/config/config.ts';
import type { AuthProvider } from './auth.provider.ts';
import { ADMIN_STATEMENTS } from './auth.consts.ts';

class AdminAuth implements AuthProvider {
  #services: Services;

  constructor(services: Services) {
    this.#services = services;
  }

  public getAccess = async (token: string) => {
    const config = this.#services.get(Config);
    if (!config.adminToken || token !== config.adminToken) {
      throw new Error('Invalid admin token');
    }
    return {
      statements: ADMIN_STATEMENTS,
    };
  };
}

export { AdminAuth };
