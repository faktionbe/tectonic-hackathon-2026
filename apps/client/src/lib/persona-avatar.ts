/**
 * Maps a persona profile to its avatar in `public/`. Each avatar file is named
 * after the persona's first name, lowercased (e.g. "Jonas" -> `/jonas.png`).
 */
const PERSONA_FIRST_NAMES = new Set([
  'lotte',
  'jonas',
  'sarah',
  'eva',
  'marc',
  'dries',
  'kelly',
]);

export const personaAvatar = (
  firstName?: string | null
): string | undefined => {
  if (!firstName) {
    return undefined;
  }
  const key = firstName.trim().toLowerCase();
  return PERSONA_FIRST_NAMES.has(key) ? `/${key}.png` : undefined;
};
