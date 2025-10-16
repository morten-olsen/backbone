import jwt from 'jsonwebtoken';

import type { Statement } from './auth.schemas.ts';
import type { AuthProvider } from './auth.provider.ts';
import { ADMIN_STATEMENTS, READER_STATEMENTS, WRITER_STATEMENTS } from './auth.consts.ts';

import type { Services } from '#root/utils/services.ts';
import { Config } from '#root/config/config.ts';

class OidcAuth implements AuthProvider {
  #services: Services;

  constructor(services: Services) {
    this.#services = services;
  }

  public getAccess = async (token: string) => {
    const data = jwt.decode(token);
    const config = this.#services.get(Config);
    if (!data || typeof data !== 'object') {
      throw new Error('JWT body malformed');
    }
    // TODO: Validate signature against issuer!!!
    if (data.exp && data.exp > Date.now() / 1000) {
      throw new Error('JWT token is expired');
    }
    let statements: Statement[] = [];
    const groups = data[config.oidc.groupField];
    if (Array.isArray(groups)) {
      if (config.oidc.groups.admin && groups.includes(config.oidc.groups.admin)) {
        statements = ADMIN_STATEMENTS;
      }
      if (config.oidc.groups.writer && groups.includes(config.oidc.groups.writer)) {
        statements = WRITER_STATEMENTS;
      }
      if (config.oidc.groups.reader && groups.includes(config.oidc.groups.reader)) {
        statements = READER_STATEMENTS;
      }
    }
    return {
      statements,
    };
  };
}

export { OidcAuth };
