import { z } from 'zod';

export const agentsEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENROUTER_API_KEY: z.string().min(1),
});
