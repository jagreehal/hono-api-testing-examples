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

  it('should error for less than 1', async () => {
    const response = await app.request('/pokemon/-1');
    expect(response.status).toBe(400);
    const body = await response.json();

    expect(body).toStrictEqual({
      code: 'TooLowError',
      id: -1,
      message: 'ID is too low',
    });
  });

  it('should error for more than 500', async () => {
    const response = await app.request('/pokemon/501');
    expect(response.status).toBe(400);
    const body = await response.json();

    expect(body).toStrictEqual({
      code: 'TooHighError',
      id: 501,
      message: 'ID is too high',
    });
  });
});
