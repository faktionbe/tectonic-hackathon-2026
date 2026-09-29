import { agentsEnvSchema } from '@/env.schema';

import 'dotenv/config';

export const env = agentsEnvSchema.parse(process.env);
