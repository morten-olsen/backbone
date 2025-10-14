import z from 'zod';

const statementSchema = z.object({
  effect: z.enum(['allow', 'disallow']),
  resources: z.array(z.string()),
  actions: z.array(z.string()),
});
type Statement = z.infer<typeof statementSchema>;

export type { Statement };
export { statementSchema };
