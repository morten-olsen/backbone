import { KubeConfig, V1Secret, type KubernetesObject } from '@kubernetes/client-node';

import { K8sWatcher } from './k8s.watcher.ts';
import type { K8sBackboneClient, K8sBackboneTopic } from './k8s.schemas.ts';

class K8sResources {
  #secrets: K8sWatcher<V1Secret>;
  #clients: K8sWatcher<KubernetesObject & { spec: K8sBackboneClient }>;
  #topics: K8sWatcher<KubernetesObject & { spec: K8sBackboneTopic }>;

  constructor(config: KubeConfig) {
    config.loadFromDefault();
    this.#secrets = new K8sWatcher({
      config,
      apiVersion: 'v1',
      kind: 'Secret',
    });
    this.#clients = new K8sWatcher({
      config,
      apiVersion: 'backbone.mortenolsen.pro/v1',
      kind: 'Client',
    });
    this.#topics = new K8sWatcher({
      config,
      apiVersion: 'backbone.mortenolsen.pro/v1',
      kind: 'Topic',
    });
  }

  public get secrets() {
    return this.#secrets;
  }

  public get clients() {
    return this.#clients;
  }

  public get topics() {
    return this.#clients;
  }

  public start = async () => {
    await this.#secrets.start();
    await this.#clients.start();
    await this.#topics.start();
  };
}

export { K8sResources };
