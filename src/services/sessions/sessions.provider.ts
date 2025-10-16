import type { AuthProvider } from '#root/auth/auth.provider.ts';

class SessionProvider {
  #handlers: Map<string, AuthProvider>;

  constructor() {
    this.#handlers = new Map();
  }

  public register = (name: string, provider: AuthProvider) => {
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

export { SessionProvider };
