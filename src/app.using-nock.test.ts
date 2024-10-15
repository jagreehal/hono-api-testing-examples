import { afterEach, describe, expect, it } from 'vitest';
import { app } from './app';

import nock from 'nock';
import type { Pokemon } from './pokemon';

describe('GET /pokemon/:id', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('should return 404 if id is not provided', async () => {
    const response = await app.request('/pokemon');
    expect(response.status).toBe(404);
  });

  it('should return nockasaur', async () => {
    const pokemon: Pokemon = {
      id: 1,
      name: 'nockasaur',
    };
    nock('https://pokeapi.co').get('/api/v2/pokemon/1').reply(200, pokemon);

    const response = await app.request('/pokemon/1');
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toStrictEqual(pokemon);
  });
});
