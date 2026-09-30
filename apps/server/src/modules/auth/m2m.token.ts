import { createHash, timingSafeEqual } from 'crypto';

/**
 * Timing-safe string compare via SHA-256 digests so unequal lengths cannot throw
 * or leak length information through `timingSafeEqual`.
 */
export function secureTokenEquals(left: string, right: string): boolean {
  const leftDigest = createHash('sha256').update(left).digest();
  const rightDigest = createHash('sha256').update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

export function extractBearerToken(
  authorizationHeader: string | undefined
): string | undefined {
  if (!authorizationHeader) {
    return undefined;
  }
  const [scheme, token, ...rest] = authorizationHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token || rest.length > 0) {
    return undefined;
  }
  return token;
}
