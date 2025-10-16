import { z } from 'zod';

import { statementSchema } from '#root/auth/auth.schemas.ts';

const k8sBackboneClientSchema = z.object({
  statements: z.array(statementSchema),
});

type K8sBackboneClient = z.infer<typeof k8sBackboneClientSchema>;

const k8sBackboneTopicSchema = z.object({
  matches: z.array(z.string()),
  schema: z.record(z.string(), z.object()),
});

type K8sBackboneTopic = z.infer<typeof k8sBackboneTopicSchema>;

export type { K8sBackboneClient, K8sBackboneTopic };
export { k8sBackboneClientSchema, k8sBackboneTopicSchema };
