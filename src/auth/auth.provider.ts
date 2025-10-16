import type { Statement } from './auth.schemas.ts';

type AuthProvider = {
  getAccess: (token: string) => Promise<{
    statements: Statement[];
  }>;
};

export type { AuthProvider };
