import { KubeConfig } from '@kubernetes/client-node';

import { K8sResources } from './k8s.resources.ts';
import { createCrd } from './k8s.crd.ts';
import { k8sBackboneClientSchema, k8sBackboneTopicSchema } from './k8s.schemas.ts';
import { K8sClients } from './k8s.clients.ts';

import { API_VERSION } from '#root/utils/consts.ts';

class K8sService {
  #config: KubeConfig;
  #resources: K8sResources;
  #clients: K8sClients;

  constructor() {
    this.#config = new KubeConfig();
    this.#config.loadFromDefault();
    this.#resources = new K8sResources(this.#config);
    this.#clients = new K8sClients({
      config: this.#config,
      resources: this.resources,
    });
  }

  public get resources() {
    return this.#resources;
  }

  public get clients() {
    return this.#clients;
  }

  public setup = async () => {
    await createCrd({
      config: this.#config,
      apiVersion: API_VERSION,
      kind: 'Client',
      scope: 'Namespaced',
      spec: k8sBackboneClientSchema,
    });
    await createCrd({
      config: this.#config,
      apiVersion: API_VERSION,
      kind: 'Topic',
      scope: 'Namespaced',
      spec: k8sBackboneTopicSchema,
    });
    await this.#resources.start();
  };
}

export { K8sService };
