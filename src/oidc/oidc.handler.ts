import jwt from 'jsonwebtoken';

import type { AccessProvider } from '#root/access/access.provider.ts';
import type { Services } from '#root/utils/services.ts';
import type { Statement } from '#root/access/access.schemas.ts';
import { Config } from '#root/config/config.ts';

const adminStatements: Statement[] = [
  {
    effect: 'allow',
    resources: ['**'],
    actions: ['**'],
  },
];
const writerStatements: Statement[] = [
  {
    effect: 'allow',
    resources: ['**'],
    actions: ['mqtt:**'],
  },
];
const readerStatements: Statement[] = [
  {
    effect: 'allow',
    resources: ['**'],
    actions: ['mqtt:read', 'mqtt:subscribe'],
  },
];

class OidcHandler implements AccessProvider {
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
        statements = adminStatements;
      }
      if (config.oidc.groups.writer && groups.includes(config.oidc.groups.writer)) {
        statements = writerStatements;
      }
      if (config.oidc.groups.reader && groups.includes(config.oidc.groups.reader)) {
        statements = readerStatements;
      }
    }
    return {
      statements,
    };
  };
}

export { OidcHandler };
