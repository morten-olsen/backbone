import { defineConfig } from 'vitest/config';

// eslint-disable-next-line
export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    globals: true,
  },
});
