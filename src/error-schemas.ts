import { z } from 'zod';

export const ErrorSchema = z.object({
  code: z.string().openapi({
    example: 'Error',
  }),
  message: z.string().openapi({
    example: 'Bad Request',
  }),
});

export const PokemonErrorSchema = ErrorSchema.extend({
  code: z.literal('Error'),
});

export const IdTooLowErrorSchema = ErrorSchema.extend({
  code: z.literal('TooLowError'),
  id: z.number().openapi({
    example: 1,
  }),
});

export const NotFoundErrorSchema = ErrorSchema.extend({
  code: z.literal('NotFoundError'),
  id: z.number().openapi({
    example: 1,
  }),
});

export type NotFoundError = z.infer<typeof NotFoundErrorSchema>;

export const IdTooHighErrorSchema = ErrorSchema.extend({
  code: z.literal('TooHighError'),
  id: z.number().openapi({
    example: 500,
  }),
});

export const ErrorResponseSchema = z.discriminatedUnion('code', [
  PokemonErrorSchema,
  IdTooLowErrorSchema,
  IdTooHighErrorSchema,
]);

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
