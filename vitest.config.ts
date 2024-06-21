/* eslint-disable unicorn/prefer-module */
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      '**/playwright-test-examples/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
