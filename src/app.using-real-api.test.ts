import supertest from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './app';

describe('GET /pokemon/:id', () => {
	it('should return 404 if id is not provided', async () => {
		const response = await app.request('/pokemon');
		expect(response.status).toBe(404);
	});

	it('should return bulbasaur', async () => {
		const response = await app.request('/pokemon/1');
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body).toStrictEqual({ id: 1, name: 'bulbasaur' });
	});
});
