import { z } from 'zod';

export const PokemonSchema = z
  .object({
    id: z.number().openapi({
      example: 123,
    }),
    name: z.string().openapi({
      example: 'John Doe',
    }),
  })
  .openapi('Pokemon');

export type Pokemon = z.infer<typeof PokemonSchema>;

const pokemonCache = new Map<number, Pokemon>();

export function setPokemonName(id, name?: string): Pokemon {
  if (!name) {
    throw new Error('name is required');
  }
  const pokemon = pokemonCache.get(id);
  if (!pokemon) {
    throw new Error(`Pokemon with id ${id} not found`);
  }
  const updatedPokemon = { ...pokemon, name };
  pokemonCache.set(id, updatedPokemon);
  return updatedPokemon;
}

export async function getPokemonName(id: number): Promise<Pokemon | undefined> {
  if (pokemonCache.has(id)) {
    return pokemonCache.get(id);
  }

  const pokemonFetch = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!pokemonFetch.ok) {
    return undefined;
  }
  const { name } = await pokemonFetch.json();
  const pokemon = { id, name };
  pokemonCache.set(id, pokemon);
  return pokemon;
}
