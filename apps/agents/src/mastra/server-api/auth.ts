import { m2mAuthHeaders } from '@/m2m-auth';

/**
 * Auth headers for Nest API calls.
 * Uses the shared M2M bearer token.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  return m2mAuthHeaders();
}
