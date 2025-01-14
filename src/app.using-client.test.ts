import { serve, type ServerType } from '@hono/node-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { app } from './app';
import { createClient } from './client';

const API_PORT = 7001;
const client = createClient(`http://localhost:${API_PORT}`);

describe('GET /pokemon/:id with hc client', () => {
  let apiServer: ServerType | undefined;
  beforeAll(() => {
    try {
      apiServer = serve({
        port: API_PORT,
        fetch: app.fetch,
      });
    } catch (error) {
      console.error('Failed to start the API server:', error);
      throw error;
    }
  });

  afterAll(() => {
    apiServer?.close();
  });

  it('should return bulbasaur', async () => {
    const response = await client.pokemon[':id'].$get({ param: { id: '1' } });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toStrictEqual({ id: 1, name: 'bulbasaur' });
  });
});
