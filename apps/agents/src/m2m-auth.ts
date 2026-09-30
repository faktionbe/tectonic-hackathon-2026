import { env } from '@/env';

/**
 * Authorization headers for Nest API calls authenticated with the shared M2M token.
 */
export function m2mAuthHeaders(): { Authorization: string } {
  return {
    Authorization: `Bearer ${env.M2M_JWT}`,
  };
}
