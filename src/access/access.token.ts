import { z } from 'zod';
import jwt from 'jsonwebtoken';

import { statementSchema } from './access.schemas.ts';
import type { AccessProvider } from './access.provider.ts';
import type { Services } from '#root/utils/services.ts';
import { Config } from '#root/config/config.ts';

const tokenBodySchema = z.object({
  statements: z.array(statementSchema),
});

type TokenBody = z.infer<typeof tokenBodySchema>;

class AccessTokens implements AccessProvider {
  #services: Services;

  constructor(services: Services) {
    this.#services = services;
  }

  public generate = (options: TokenBody) => {
    const config = this.#services.get(Config);
    const { tokenSecret } = config;
    if (!tokenSecret) {
      throw new Error('Token secret does not exist');
    }
    const token = jwt.sign(options, tokenSecret);
    return token;
  };

  public getAccess = async (token: string) => {
    const config = this.#services.get(Config);
    const { tokenSecret } = config;
    if (!tokenSecret) {
      throw new Error('Token secret does not exist');
    }
    const data = jwt.verify(token, tokenSecret);
    const parsed = tokenBodySchema.parse(data);
    return parsed;
  };
}

export { AccessTokens };
