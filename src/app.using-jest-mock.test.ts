import supertest from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import type { Pokemon } from './pokemon';

const mocks = vi.hoisted(() => {
	return {
		getPokemonName: vi.fn(),
	};
});

vi.mock('./pokemon', async (importOriginal) => {
	const mod = await importOriginal<typeof import('./pokemon')>();
	return {
		...mod,
		// replace some exports
		getPokemonName: mocks.getPokemonName,
	};
});

// has to be after mock
import { app } from './app';

describe('GET /pokemon/:id', () => {
	it('should return 404 if id is not provided', async () => {
		const response = await app.request('/pokemon');
		expect(response.status).toBe(404);
	});

	it('should return Mockasaur using mock', async () => {
		const pokemon: Pokemon = {
			id: 1,
			name: 'Mockasaur',
		};

		vi.mocked(mocks.getPokemonName).mockImplementationOnce(() =>
			Promise.resolve(pokemon),
		);

		const response = await app.request('/pokemon/1');
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body).toStrictEqual(pokemon);
	});
});
