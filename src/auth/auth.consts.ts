import type { Statement } from './auth.schemas.ts';

const ADMIN_STATEMENTS: Statement[] = [
  {
    effect: 'allow',
    resources: ['**'],
    actions: ['**'],
  },
];
const WRITER_STATEMENTS: Statement[] = [
  {
    effect: 'allow',
    resources: ['**'],
    actions: ['mqtt:**'],
  },
];
const READER_STATEMENTS: Statement[] = [
  {
    effect: 'allow',
    resources: ['**'],
    actions: ['mqtt:read', 'mqtt:subscribe'],
  },
];

export { ADMIN_STATEMENTS, WRITER_STATEMENTS, READER_STATEMENTS };
