import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/playwright-test-examples',
  testMatch: '*.test.ts',
});
