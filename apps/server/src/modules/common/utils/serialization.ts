/**
 * Mapping helpers between Prisma rows (snake_case columns, `null` for absent
 * optionals, `Date`/`Decimal` values) and the camelCase Zod contracts (which
 * use `.optional()` — i.e. `undefined`, not `null` — and ISO string dates).
 */

/** `null` -> `undefined` so response serialization against `.optional()` passes. */
export function orUndefined<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}

/** Format a Date as an ISO date-only string (`YYYY-MM-DD`). */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Optional Date -> ISO date-only string, or undefined. */
export function toOptIsoDate(
  date: Date | null | undefined
): string | undefined {
  return date ? toIsoDate(date) : undefined;
}

/** Optional Date -> full ISO datetime string, or undefined. */
export function toOptIsoDateTime(
  date: Date | null | undefined
): string | undefined {
  return date ? date.toISOString() : undefined;
}

/** Date -> full ISO datetime string. */
export const toIsoDateTime = (date: Date): string => date.toISOString();

/** Date or null -> ISO date-only string, or null. */
export const toNullableIsoDate = (date: Date | null): string | null =>
  date === null ? null : toIsoDate(date);

/** Date or null -> full ISO datetime string, or null. */
export const toNullableIsoDateTime = (date: Date | null): string | null =>
  date === null ? null : date.toISOString();
