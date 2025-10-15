import type { AccessProvider } from './access.provider.ts';

class AccessHandler {
  #handlers: Map<string, AccessProvider>;

  constructor() {
    this.#handlers = new Map();
  }

  public register = (name: string, provider: AccessProvider) => {
    this.#handlers.set(name, provider);
  };

  public validate = (provider: string, token: string) => {
    const handler = this.#handlers.get(provider);
    if (!handler) {
      throw new Error('Provider not available');
    }
    return handler.getAccess(token);
  };
}

export { AccessHandler };
