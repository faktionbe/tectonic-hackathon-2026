import { env } from '@/env';

const PROFILE_ID_KEY = 'profileId';

function nonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  return trimmed;
}

function isKeyedGetter(value: unknown): value is (key: string) => unknown {
  return typeof value === 'function';
}

function readContextString(
  requestContext: object,
  key: string
): string | undefined {
  const getter: unknown = Reflect.get(requestContext, 'get');
  if (isKeyedGetter(getter)) {
    const fromGetter = nonEmptyString(getter.call(requestContext, key));
    if (fromGetter !== undefined) {
      return fromGetter;
    }
  }

  return nonEmptyString({ ...requestContext }[key]);
}

/**
 * Profile id for savings advice: the chat request's `profileId`, or the dummy default.
 */
export function readProfileId(requestContext: unknown): string {
  if (typeof requestContext === 'object' && requestContext !== null) {
    const profileId = readContextString(requestContext, PROFILE_ID_KEY);
    if (profileId !== undefined) {
      return profileId;
    }
  }

  return env.DEFAULT_PROFILE_ID;
}

export function appendCustomerId(prompt: string, profileId: string): string {
  const line = `customerId: ${profileId}`;
  if (prompt.includes(line)) {
    return prompt;
  }

  const trimmed = prompt.trimEnd();
  if (trimmed.length === 0) {
    return line;
  }

  return `${trimmed}\n\n${line}`;
}
