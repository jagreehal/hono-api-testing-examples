import '@total-typescript/ts-reset';

import { serve } from '@hono/node-server';

import { app } from './app';

const PORT = process.env.PORT || 5000;

serve({
  port: +PORT,
  fetch: app.fetch,
});

console.log(`server listening on http://localhost:${PORT}`);
