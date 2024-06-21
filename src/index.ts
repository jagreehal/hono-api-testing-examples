import { type ServerType, serve } from '@hono/node-server';
const PORT = process.env.PORT || 5000;
import { app } from './app';
serve({
	port: +PORT,
	fetch: app.fetch,
});

console.log(`server listening on http://localhost:${PORT}`);
