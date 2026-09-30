import { z } from 'zod';

export const agentsEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENROUTER_API_KEY: z.string().min(1),
  /**
   * Base URL for real customer profile/finances APIs.
   * Leave unset while using mocks (CUSTOMER_DATA_USE_MOCKS=true).
   */
  CUSTOMER_DATA_BASE_URL: z.string().url().optional(),
  /**
   * When true (default), savings advice uses in-memory mock customer data
   * instead of (or before) calling CUSTOMER_DATA_BASE_URL.
   * WARNING: set to false only after real endpoints are wired in data-clients.ts.
   */
  CUSTOMER_DATA_USE_MOCKS: z.preprocess((value) => {
    if (value === undefined || value === '') {
      return true;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() !== 'false' && value !== '0';
    }
    return true;
  }, z.boolean()),
});
