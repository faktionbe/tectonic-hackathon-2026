import { z } from 'zod';

export const financialHolderSchema = z
  .object({
    id: z.string(),
    profileId: z.string().nullable(),
    displayName: z.string().trim().min(1),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: 'FinancialHolder' });

export type FinancialHolder = z.infer<typeof financialHolderSchema>;
