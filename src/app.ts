import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { logger } from 'hono/logger';
import { poweredBy } from 'hono/powered-by';

import {
  ErrorResponseSchema,
  NotFoundErrorSchema,
  type ErrorResponse,
  type NotFoundError,
} from './error-schemas';
import { getPokemonName, PokemonSchema, setPokemonName } from './pokemon';

// const HeadersSchema = z.object({
//   authorization: z.string().openapi({
//     example: 'Bearer SECRET',
//   }),
// });

const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          ok: false,
          errors: formatZodErrors(result),
          source: 'custom_error_handler',
        },
        422
      );
    }
  },
});

app.use(poweredBy());
app.use(logger());

app.doc31('/api/swagger.json', {
  openapi: '3.1.0',
  info: { title: 'Hono API Testing Examples', version: '1.0.0' },
});

// app.get(
//   '/api/scalar',
//   apiReference({
//     spec: {
//       url: '/api/swagger.json',
//     },
//   }),
// );

const ParamsSchema = z.object({
  id: z
    .string()
    .min(1)
    .openapi({
      param: {
        name: 'id',
        in: 'path',
      },
      example: '1212121',
    }),
});

const pokemonGet = createRoute({
  method: 'get',
  path: '/pokemon/{id}',
  request: {
    params: ParamsSchema,
    // headers: HeadersSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PokemonSchema,
        },
      },
      description: 'Retrieve the pokemon',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Returns an error',
    },
    404: {
      content: {
        'application/json': {
          schema: NotFoundErrorSchema,
        },
      },
      description: 'Returns an error',
    },
  },
});

export const pokemonGetRoute = new OpenAPIHono().openapi(
  pokemonGet,
  async (c) => {
    const id = Number.parseInt(c.req.param('id'), 10);

    if (!id) {
      const error: ErrorResponse = {
        code: 'TooLowError',
        message: 'ID is too low',
        id,
      };
      return c.json(error, 400);
    }
    if (id < 1) {
      const error: ErrorResponse = {
        code: 'TooLowError',
        message: 'ID is too low',
        id,
      };
      return c.json(error, 400);
    }
    if (id > 500) {
      const error: ErrorResponse = {
        code: 'TooHighError',
        message: 'ID is too high',
        id,
      };
      return c.json(error, 400);
    }
    const pokemon = await getPokemonName(+id);
    if (!pokemon) {
      const error: NotFoundError = {
        code: 'NotFoundError',
        message: 'ID is too low',
        id,
      };
      return c.json(error, 404);
    }
    return c.json(pokemon, 200);
  }
);

export const pokemonPostBodySchema = z.object({
  name: z.string().min(1, { message: 'Name can not be empty.' }),
});

export type PokemonPost = z.infer<typeof pokemonPostBodySchema>;

const pokemonPost = createRoute({
  method: 'post',
  path: '/pokemon/{id}',
  request: {
    params: ParamsSchema,
    body: {
      description: 'Pokemon name',
      required: true,
      content: {
        'application/json': {
          schema: pokemonPostBodySchema.openapi('Pokemon'),
        },
      },
    },
    // headers: HeadersSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PokemonSchema,
        },
      },
      description: 'Retrieve the pokemon',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Bad Request (e.g., ID too low or too high)',
    },
    404: {
      content: {
        'application/json': {
          schema: NotFoundErrorSchema,
        },
      },
      description: 'Not Found',
    },
  },
});

export const pokemonPostRoute = new OpenAPIHono().openapi(
  pokemonPost,
  async (c) => {
    const id = Number.parseInt(c.req.param('id'), 10);
    if (id < 1) {
      const error: ErrorResponse = {
        code: 'TooLowError',
        message: 'ID is too low',
        id,
      };
      return c.json(error, 400);
    }
    if (id > 500) {
      const error: ErrorResponse = {
        code: 'TooHighError',
        message: 'ID is too high',
        id,
      };
      return c.json(error, 400);
    }
    const { name } = c.req.valid('json');

    const pokemon = await setPokemonName(+id, name);
    if (!pokemon) {
      const error: NotFoundError = {
        code: 'NotFoundError',
        message: 'Pokemon not found',
        id,
      };
      return c.json(error, 404);
    }
    return c.json(pokemon, 200);
  }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app.route('/', pokemonGetRoute).route('/', pokemonPostRoute);

export type AppType = typeof routes;

type ZodFormattedError = { path: string; message: string };

function formatZodErrors(result: {
  success: false;
  error: z.ZodError;
}): ZodFormattedError[] {
  const formattedErrors: ZodFormattedError[] = [];
  const { error } = result;

  for (const issue of error.issues) {
    const formattedIssue = {
      path: issue.path.join('.'),
      message: issue.message,
    };
    formattedErrors.push(formattedIssue);
  }

  return formattedErrors;
}
export { app };
