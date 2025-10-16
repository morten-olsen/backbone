import { KubernetesObjectApi, type KubernetesObject } from '@kubernetes/client-node';

import { K8sResources } from './k8s.resources.ts';
import type { K8sBackboneClient } from './k8s.schemas.ts';

import type { AccessProvider } from '#root/access/access.provider.ts';
import type { Statement } from '#root/access/access.schemas.ts';
import type { Services } from '#root/utils/services.ts';
import { K8sConfig } from './k8s.config.ts';

type K8sClient = {
  statements: Statement[];
};

class K8sClients implements AccessProvider {
  #services: Services;
  #clients: Map<string, K8sClient>;

  constructor(services: Services) {
    this.#services = services;
    this.#clients = new Map();
    const { clients } = services.get(K8sResources);
    clients.on('updated', this.#handleClientAdded);
  }

  #handleClientAdded = async (manifest: KubernetesObject & { spec: K8sBackboneClient }) => {
    const resources = this.#services.get(K8sResources);
    const { config } = this.#services.get(K8sConfig);
    const secretName = `${manifest.metadata?.name}-secret`;
    const secret = resources.secrets.manifests.find(
      (m) => m.metadata?.namespace === manifest.metadata?.namespace && m.metadata?.name === secretName,
    );
    const token = secret?.data?.token || crypto.randomUUID();
    if (!secret) {
      const objectsApi = config.makeApiClient(KubernetesObjectApi);

      const body = {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
          name: secretName,
          namespace: manifest.metadata?.namespace,
        },
        data: {
          token: Buffer.from(token).toString('base64'),
        },
      };
      await objectsApi.create(body, undefined, undefined, undefined, undefined);
    }
    if (!token) {
      throw new Error('Secret is missing token');
    }
    const tokenValue = Buffer.from(token, 'base64').toString('utf8');
    this.#clients.set(tokenValue, {
      statements: manifest.spec.statements,
    });
  };

  public getAccess = async (token: string) => {
    const client = this.#clients.get(token);
    if (!client) {
      throw new Error('invalid credentials');
    }
    return client;
  };
}

export { K8sClients };
