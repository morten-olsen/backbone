import { z } from 'zod';

const topicDefinitionSchema = z.object({
  matches: z.array(z.string()),
  name: z.string().optional(),
  description: z.string().optional(),
  schema: z.object().optional(),
  qos: z.array(z.number()).optional(),
  retain: z.boolean().optional(),
});

type TopicDefinition = z.infer<typeof topicDefinitionSchema>;

export type { TopicDefinition };
export { topicDefinitionSchema };
