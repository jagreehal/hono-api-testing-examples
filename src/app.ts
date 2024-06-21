import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
import { basicAuth } from 'hono/basic-auth';
import { logger } from 'hono/logger';
import { poweredBy } from 'hono/powered-by';
import { PokemonSchema, getPokemonName, setPokemonName } from './pokemon';
const HeadersSchema = z.object({
	authorization: z.string().openapi({
		example: 'Bearer SECRET',
	}),
});

const app = new OpenAPIHono({
	defaultHook: (result, c) => {
		if (!result.success) {
			return c.json(
				{
					ok: false,
					errors: formatZodErrors(result),
					source: 'custom_error_handler',
				},
				422,
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

app.get(
	'/api/scalar',
	apiReference({
		spec: {
			url: '/api/swagger.json',
		},
	}),
);

const ErrorSchema = z.object({
	code: z.number().openapi({
		example: 400,
	}),
	message: z.string().openapi({
		example: 'Bad Request',
	}),
});

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
					schema: ErrorSchema,
				},
			},
			description: 'Returns an error',
		},
		404: {
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
			description: 'Returns an error',
		},
	},
});

export const pokemonGetRoute = new OpenAPIHono().openapi(
	pokemonGet,
	async (c) => {
		const id = c.req.param('id');
		if (!id) {
			return c.json({ code: 400, message: 'id is required' }, 400);
		}
		const pokemon = await getPokemonName(+id);
		if (!pokemon) {
			return c.json({ code: 404, message: 'pokemon not found' }, 404);
		}
		return c.json(pokemon, 200);
	},
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
					schema: ErrorSchema,
				},
			},
			description: 'Returns an error',
		},
		404: {
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
			description: 'Returns an error',
		},
	},
});

export const pokemonPostRoute = new OpenAPIHono().openapi(
	pokemonPost,
	async (c) => {
		const id = c.req.param('id');
		if (!id) {
			return c.json({ code: 400, message: 'id is required' }, 400);
		}

		const { name } = c.req.valid('json');

		const pokemon = await setPokemonName(+id, name);

		if (!pokemon) {
			return c.json({ code: 404, message: 'pokemon not found' }, 404);
		}
		return c.json(pokemon, 200);
	},
);

const routes = app.route('/', pokemonGetRoute).route('/', pokemonPostRoute);

export type AppType = typeof routes;

export { app };

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
