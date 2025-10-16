import { validate } from './sessions.utils.ts';

import type { Statement } from '#root/auth/auth.schemas.ts';

type SessionOptions = {
  statements: Statement[];
};

type ValidateOptions = {
  action: string;
  resource: string;
};

class Session {
  #options: SessionOptions;

  constructor(options: SessionOptions) {
    this.#options = options;
  }

  public get statements() {
    return this.#options.statements;
  }

  public validate = (options: ValidateOptions) => {
    const { statements } = this.#options;
    return validate({
      ...options,
      statements,
    });
  };
}

export { Session };
