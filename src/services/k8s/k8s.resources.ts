import { V1Secret, type KubernetesObject } from '@kubernetes/client-node';

import { K8sWatcher } from './k8s.watcher.ts';
import type { K8sBackboneClient, K8sBackboneTopic } from './k8s.schemas.ts';
import { K8sConfig } from './k8s.config.ts';

import type { Services } from '#root/utils/services.ts';

class K8sResources {
  #services: Services;
  #secrets?: K8sWatcher<V1Secret>;
  #clients?: K8sWatcher<KubernetesObject & { spec: K8sBackboneClient }>;
  #topics?: K8sWatcher<KubernetesObject & { spec: K8sBackboneTopic }>;

  constructor(services: Services) {
    this.#services = services;
  }

  public get secrets() {
    if (!this.#secrets) {
      const { config } = this.#services.get(K8sConfig);
      this.#secrets = new K8sWatcher({
        config,
        apiVersion: 'v1',
        kind: 'Secret',
      });
    }
    return this.#secrets;
  }

  public get clients() {
    if (!this.#clients) {
      const { config } = this.#services.get(K8sConfig);
      this.#clients = new K8sWatcher({
        config,
        apiVersion: 'backbone.mortenolsen.pro/v1',
        kind: 'Client',
      });
    }
    return this.#clients;
  }

  public get topics() {
    if (!this.#topics) {
      const { config } = this.#services.get(K8sConfig);
      this.#topics = new K8sWatcher({
        config,
        apiVersion: 'backbone.mortenolsen.pro/v1',
        kind: 'Topic',
      });
    }
    return this.#topics;
  }

  public start = async () => {
    await this.secrets.start();
    await this.clients.start();
    await this.topics.start();
  };
}

export { K8sResources };
