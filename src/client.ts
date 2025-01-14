import { hc } from 'hono/client';

import type { AppType } from './app';

export const createClient = hc<AppType>;
