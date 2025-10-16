import type { AuthProvider } from '#root/auth/auth.provider.ts';
import { Session } from './sessions.session.ts';

class SessionProvider {
  #handlers: Map<string, AuthProvider>;

  constructor() {
    this.#handlers = new Map();
  }

  public get providers() {
    return Array.from(this.#handlers.keys());
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

  public get = async (provider: string, token: string) => {
    const handler = this.#handlers.get(provider);
    if (!handler) {
      throw new Error('Provider not available');
    }
    const access = await handler.getAccess(token);
    return new Session(access);
  };
}

export { SessionProvider };
