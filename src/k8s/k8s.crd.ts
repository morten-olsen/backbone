import { type KubeConfig, ApiException, ApiextensionsV1Api } from '@kubernetes/client-node';
import { z, type ZodType } from 'zod';

type CreateCrdOptions = {
  config: KubeConfig;
  kind: string;
  apiVersion: string;
  plural?: string;
  scope: 'Cluster' | 'Namespaced';
  spec: ZodType;
};
const createCrd = async (options: CreateCrdOptions) => {
  const { config, ...definition } = options;
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

export { createCrd };
