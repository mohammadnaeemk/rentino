/**
 * Pagination metadata, matching the frontend's `ApiMeta` shape exactly
 * (`src/lib/api.ts`): `{ page, limit, total, totalPages }`.
 */
export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * A paginated payload. Controllers return this and the global transform
 * interceptor lifts `data` and `meta` into the response envelope:
 * `{ success, message, data, meta }`.
 */
export class Paginated<T> {
  constructor(
    public readonly data: T[],
    public readonly meta: ApiMeta,
  ) {}
}

export function buildMeta(total: number, page: number, limit: number): ApiMeta {
  return {
    page,
    limit,
    total,
    totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
  };
}
