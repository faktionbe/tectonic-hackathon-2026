export type RenameKeys<T, M extends Partial<Record<keyof T, string>>> = {
  [K in keyof T as K extends keyof M
    ? M[K] extends string
      ? M[K]
      : never
    : K]: T[K];
};

/** Rename the keys of `input` using `keyMap`; keys not in the map are kept as-is. */
export const renameKeys = <
  T extends object,
  M extends Partial<Record<keyof T, string>>,
>(
  input: T,
  keyMap: M
): RenameKeys<T, M> => {
  const lookup = keyMap as Record<string, string | undefined>;
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [lookup[key] ?? key, value])
  ) as RenameKeys<T, M>;
};
