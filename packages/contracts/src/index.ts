import { z } from 'zod';

export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export * from './expense';
export * from './party';
export * from './subscription';
