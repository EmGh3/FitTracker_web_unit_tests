import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'], // Only run tests in the tests folder
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.spec.ts'] // Exclude Angular spec files
  }
});