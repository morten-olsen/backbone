import { K8sResources } from './k8s.resources.ts';
import { K8sCrds } from './k8s.crd.ts';
import { k8sBackboneClientSchema, k8sBackboneTopicSchema } from './k8s.schemas.ts';

import { API_VERSION } from '#root/utils/consts.ts';
import type { Services } from '#root/utils/services.ts';

class K8sService {
  #services: Services;

  constructor(services: Services) {
    this.#services = services;
  }

  public get resources() {
    return this.#services.get(K8sResources);
  }

  public setup = async () => {
    const crds = this.#services.get(K8sCrds);
    await crds.install({
      apiVersion: API_VERSION,
      kind: 'Client',
      scope: 'Namespaced',
      spec: k8sBackboneClientSchema,
    });
    await crds.install({
      apiVersion: API_VERSION,
      kind: 'Topic',
      scope: 'Namespaced',
      spec: k8sBackboneTopicSchema,
    });
    await this.resources.start();
  };
}

export { K8sService };
