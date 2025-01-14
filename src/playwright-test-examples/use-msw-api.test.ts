import { serve, type ServerType } from '@hono/node-server';
import { expect, test } from '@playwright/test';
import { http, HttpResponse, passthrough } from 'msw';
import { setupServer } from 'msw/node';

import { app } from '../app';
import type { Pokemon } from '../pokemon';

const pokemon: Pokemon = {
  id: 1,
  name: 'mswasaur',
};

const API_PORT = 7000; // todo: use random port

// set up handlers
export const handlers = [
  http.get(`http://localhost:${API_PORT}/pokemon/1`, () => {
    return passthrough();
  }),
  http.get('https://pokeapi.co/api/v2/pokemon/1', () => {
    return HttpResponse.json(pokemon);
  }),
];

// set up server
export const server = setupServer(...handlers);
server.events.on('request:start', ({ request }) => {
  console.log('MSW intercepted:', request.method, request.url);
});

let apiServer: ServerType;

test.describe.skip('GET /pokemon/:id', () => {
  test.beforeAll(async () => {
    await new Promise<void>((resolve) => {
      apiServer = serve({
        port: API_PORT,
        fetch: app.fetch,
      });
      resolve();
    });
    server.listen({ onUnhandledRequest: 'warn' });
  });

  test.afterEach(() => server.resetHandlers());

  test.afterAll(() => {
    server.close();
    apiServer.close();
  });

  test('should return 404 if id is not provided', async ({ request }) => {
    const response = await request.get(`http://localhost:${API_PORT}/pokemon`);
    expect(response.status()).toBe(404);
  });

  test('should return bulbasaur', async ({ request }) => {
    const response = await request.get(
      `http://localhost:${API_PORT}/pokemon/1`
    );
    const body = await response.json();
    expect(body).toStrictEqual(pokemon);
  });
});
