import { z } from 'zod';

import { env } from '@/env';

import { getAuthHeaders } from './auth';

export class ServerApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(status: number, path: string, detail?: string) {
    super(
      detail
        ? `Server API ${status} for ${path}: ${detail}`
        : `Server API ${status} for ${path}`
    );
    this.name = 'ServerApiError';
    this.status = status;
    this.path = path;
  }
}

function buildUrl(
  path: string,
  query?: Record<string, string | number | undefined>
): string {
  const base = env.SERVER_API_URL.replace(/\/$/u, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

export async function get<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  query?: Record<string, string | number | undefined>
): Promise<z.infer<TSchema>> {
  const url = buildUrl(path, query);
  const headers = await getAuthHeaders();

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => undefined);
    throw new ServerApiError(response.status, path, detail);
  }

  const json: unknown = await response.json();
  return schema.parse(json);
}

const offsetPageSchema = <TItem extends z.ZodType>(itemSchema: TItem) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number(),
    pageIndex: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  });

const DEFAULT_PAGE_SIZE = 100;

export async function listAll<TItem extends z.ZodType>(
  path: string,
  itemSchema: TItem,
  query?: Record<string, string | number | undefined>
): Promise<Array<z.infer<TItem>>> {
  const pageSchema = offsetPageSchema(itemSchema);
  const results: Array<z.infer<TItem>> = [];
  let pageIndex = 0;

  for (;;) {
    const page = await get(path, pageSchema, {
      ...query,
      pageIndex,
      pageSize: DEFAULT_PAGE_SIZE,
    });
    results.push(...page.data);

    if (pageIndex + 1 >= page.totalPages || page.data.length === 0) {
      break;
    }
    pageIndex += 1;
  }

  return results;
}
