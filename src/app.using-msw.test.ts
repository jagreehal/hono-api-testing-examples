import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

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

import { app } from './app';
import type { Pokemon } from './pokemon';

describe('GET /pokemon/:id', () => {
	beforeAll(() =>
		server.listen({
			// onUnhandledRequest: ({ method, url }) => {
			//   if (!url.endsWith('/pokemon/1')) {
			//     throw new Error(`Unhandled ${method} request to ${url}`);
			//   }
			// },
		}),
	);
	// Reset any request handlers that we may add during the tests,
	// so they don't affect other tests.
	afterEach(() => server.resetHandlers());
	// Clean up after the tests are finished.

	it('should return 404 if id is not provided', async () => {
		const response = await app.request('/pokemon');
		expect(response.status).toBe(404);
	});

	it('should return mswasaur', async () => {
		const response = await app.request('/pokemon/1');
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body).toStrictEqual(pokemon);
	});
});
