import { KubernetesObjectApi, PatchStrategy, type KubeConfig, type KubernetesObject } from '@kubernetes/client-node';

import type { K8sResources } from './k8s.resources.ts';
import type { K8sBackboneClient } from './k8s.schemas.ts';

import type { AccessProvider } from '#root/access/access.provider.ts';
import type { Statement } from '#root/access/access.schemas.ts';

type K8sClientsOptions = {
  config: KubeConfig;
  resources: K8sResources;
};

type K8sClient = {
  statements: Statement[];
};

class K8sClients implements AccessProvider {
  #options: K8sClientsOptions;
  #clients: Map<string, K8sClient>;

  constructor(options: K8sClientsOptions) {
    this.#clients = new Map();
    this.#options = options;
    const { clients } = options.resources;
    clients.on('updated', this.#handleClientAdded);
  }

  #handleClientAdded = async (manifest: KubernetesObject & { spec: K8sBackboneClient }) => {
    const { resources, config } = this.#options;
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
