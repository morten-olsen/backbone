import { z } from 'zod';
import jwt from 'jsonwebtoken';

import { statementSchema } from './access.schemas.ts';
import type { AccessProvider } from './access.provider.ts';

type AccessTokensOptions = {
  secret: string | Buffer;
};

const tokenBodySchema = z.object({
  statements: z.array(statementSchema),
});

type TokenBody = z.infer<typeof tokenBodySchema>;

class AccessTokens implements AccessProvider {
  #options: AccessTokensOptions;

  constructor(options: AccessTokensOptions) {
    this.#options = options;
  }

  public generate = (options: TokenBody) => {
    const { secret } = this.#options;
    const token = jwt.sign(options, secret);
    return token;
  };

  public getAccess = async (token: string) => {
    const { secret } = this.#options;
    const data = jwt.verify(token, secret);
    const parsed = tokenBodySchema.parse(data);
    return parsed;
  };
}

export { AccessTokens };
