import type { Statement } from './access.schemas.ts';

type AccessProvider = {
  getAccess: (token: string) => Promise<{
    statements: Statement[];
  }>;
};

export type { AccessProvider };
