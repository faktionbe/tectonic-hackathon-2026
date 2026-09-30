import { z } from 'zod';

export const agentsEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENROUTER_API_KEY: z.string().min(1),
  /**
   * Shared static bearer token for machine-to-machine calls to the Nest server.
   * Must match `M2M_JWT` on the server.
   */
  M2M_JWT: z.string().min(1),
  /**
   * Nest API base URL including the global `/api` prefix.
   * Example: http://localhost:4000/api
   */
  SERVER_API_URL: z.string().url().default('http://localhost:4000/api'),
  /**
   * Origin of this Mastra server. Kate calls the savings agent over A2A here.
   */
  A2A_BASE_URL: z.string().url().default('http://127.0.0.1:4111'),
  /**
   * Profile id used when a chat request does not include `requestContext.profileId`.
   */
  DEFAULT_PROFILE_ID: z.string().min(1).default('dummy-profile'),
});
