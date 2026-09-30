import { z } from 'zod';

export const agentsEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENROUTER_API_KEY: z.string().min(1),
  /**
   * Reserved for a later database-backed tool. Mock tools do not read it.
   */
  CUSTOMER_DATA_BASE_URL: z.string().url().optional(),
  /**
   * Reserved for a later database-backed tool. Mock tools do not read it.
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
