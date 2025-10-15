import type { PublishPacket } from 'aedes';
import micromatch from 'micromatch';
import { Ajv } from 'ajv';

import type { TopicsProvider } from './topics.provider.ts';

class TopicsHandler {
  #handlers: Set<TopicsProvider>;
  #ajv: Ajv;

  constructor() {
    this.#handlers = new Set();
    this.#ajv = new Ajv();
  }

  public get topics() {
    return Array.from(this.#handlers).flatMap((handler) => handler.definitions);
  }

  public register = (provider: TopicsProvider) => {
    this.#handlers.add(provider);
  };

  public validate = (packet: PublishPacket) => {
    if (packet.topic.startsWith('$SYS/')) {
      return true;
    }
    const matches = this.topics.filter((topic) => micromatch.isMatch(packet.topic, topic.matches));
    const isValid =
      matches.length === 0 ||
      matches.some((topic) => {
        if (topic.qos && !topic.qos.includes(packet.qos)) {
          return false;
        }
        if (topic.retain !== undefined && packet.retain !== topic.retain) {
          return false;
        }
        if (topic.schema) {
          const data = JSON.parse(packet.payload.toString('utf8'));
          const validate = this.#ajv.compile(topic.schema);
          const valid = validate(data);
          if (!valid) {
            return false;
          }
        }
        return true;
      });
    return isValid;
  };
}

export { TopicsHandler };
