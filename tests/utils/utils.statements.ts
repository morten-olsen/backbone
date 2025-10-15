import type { Statement } from '#root/access/access.schemas.ts';

const statements = {
  all: [
    {
      effect: 'allow',
      resources: ['**'],
      actions: ['**'],
    },
  ],
  noRead: [
    {
      effect: 'allow',
      resources: ['**'],
      actions: ['**'],
    },
    {
      effect: 'disallow',
      resources: ['**'],
      actions: ['mqtt:read'],
    },
  ],
} satisfies Record<string, Statement[]>;

export { statements };
