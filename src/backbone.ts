import { AccessHandler } from './access/access.handler.ts';
import { K8sService } from './k8s/k8s.ts';
import { MqttServer } from './server/server.ts';
import { TopicsHandler } from './topics/topics.handler.ts';
import { Services } from './utils/services.ts';

class Backbone {
  #services: Services;

  constructor(services = new Services()) {
    this.#services = services;
  }

  public get services() {
    return this.#services;
  }

  public get server() {
    return this.#services.get(MqttServer);
  }

  public get accessHandler() {
    return this.#services.get(AccessHandler);
  }

  public get topicsHandler() {
    return this.#services.get(TopicsHandler);
  }

  public get k8s() {
    return this.#services.get(K8sService);
  }

  public setupK8sOperator = async () => {
    await this.k8s.setup();
    this.accessHandler.register('k8s', this.k8s.clients);
  };
}

export { Backbone };
