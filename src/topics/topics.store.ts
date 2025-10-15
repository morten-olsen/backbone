import type { TopicDefinition } from './topcis.schemas.ts';
import type { TopicsProvider } from './topics.provider.ts';

class TopicsStore implements TopicsProvider {
  #definitions: Set<TopicDefinition>;

  constructor() {
    this.#definitions = new Set();
  }

  public get definitions() {
    return Array.from(this.#definitions);
  }

  public register = (...definitions: TopicDefinition[]) => {
    definitions.forEach(this.#definitions.add);
  };
}

export { TopicsStore };
