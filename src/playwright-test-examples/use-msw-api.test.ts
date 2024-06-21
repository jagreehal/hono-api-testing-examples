import { type ServerType, serve } from '@hono/node-server';
import { expect, test } from '@playwright/test';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { app } from '../app';
import type { Pokemon } from '../pokemon';

const pokemon: Pokemon = {
	id: 1,
	name: 'mswasaur',
};

// set up handlers
export const handlers = [
	http.get('https://pokeapi.co/api/v2/pokemon/1', () => {
		return HttpResponse.json(pokemon);
	}),
];

// set up server
export const server = setupServer(...handlers);

let apiServer: ServerType;
const API_PORT = 7000; // todo: use random port

test.describe('GET /pokemon/:id', () => {
	test.beforeAll(async () => {
		await new Promise<void>((resolve) => {
			apiServer = serve({
				port: API_PORT,
				fetch: app.fetch,
			});
			resolve();
		});
		server.listen();
	});

	test.afterEach(() => server.resetHandlers());

	test.afterAll(() => {
		apiServer.close();
	});

	test('should return 404 if id is not provided', async ({ request }) => {
		const response = await request.get(`http://localhost:${API_PORT}/pokemon`);
		expect(response.status()).toBe(404);
	});

	test('should return bulbasaur', async ({ request }) => {
		const response = await request.get(
			`http://localhost:${API_PORT}/pokemon/1`,
		);
		const body = await response.json();
		expect(body).toStrictEqual(pokemon);
	});
});
