import type { Services } from '#root/utils/services.ts';
import { ApiException, ApiextensionsV1Api } from '@kubernetes/client-node';
import { z, type ZodType } from 'zod';
import { K8sConfig } from './k8s.config.ts';

type CreateCrdOptions = {
  kind: string;
  apiVersion: string;
  plural?: string;
  scope: 'Cluster' | 'Namespaced';
  spec: ZodType;
};
class K8sCrds {
  #services: Services;

  constructor(services: Services) {
    this.#services = services;
  }

  install = async (definition: CreateCrdOptions) => {
    const { config } = this.#services.get(K8sConfig);
    const plural = definition.plural ?? definition.kind.toLowerCase() + 's';
    const [version, group] = definition.apiVersion.split('/').toReversed();
    const manifest = {
      apiVersion: 'apiextensions.k8s.io/v1',
      kind: 'CustomResourceDefinition',
      metadata: {
        name: `${plural}.${group}`,
      },
      spec: {
        group: group,
        names: {
          kind: definition.kind,
          plural: plural,
          singular: definition.kind.toLowerCase(),
        },
        scope: definition.scope,
        versions: [
          {
            name: version,
            served: true,
            storage: true,
            schema: {
              openAPIV3Schema: {
                type: 'object',
                properties: {
                  spec: {
                    ...z.toJSONSchema(definition.spec, { io: 'input' }),
                    $schema: undefined,
                    additionalProperties: undefined,
                  } as ExplicitAny,
                },
              },
            },
            subresources: {
              status: {},
            },
          },
        ],
      },
    };
    const extensionsApi = config.makeApiClient(ApiextensionsV1Api);
    try {
      await extensionsApi.createCustomResourceDefinition({
        body: manifest,
      });
    } catch (error) {
      if (error instanceof ApiException && error.code === 409) {
        await extensionsApi.patchCustomResourceDefinition({
          name: manifest.metadata.name,
          body: [{ op: 'replace', path: '/spec', value: manifest.spec }],
        });
      } else {
        throw error;
      }
    }
  };
}

export { K8sCrds };
