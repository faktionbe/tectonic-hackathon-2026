import { z } from 'zod';

export const accountKindSchema = z.enum(['CURRENT', 'SAVINGS']);

export type AccountKind = z.infer<typeof accountKindSchema>;

export const accountPurposeSchema = z.enum(['PERSONAL', 'BUSINESS']);

export type AccountPurpose = z.infer<typeof accountPurposeSchema>;

export const accountStatusSchema = z.enum(['ACTIVE', 'BLOCKED', 'CLOSED']);

export type AccountStatus = z.infer<typeof accountStatusSchema>;

export const accountSchema = z
  .object({
    id: z.string(),
    holderIds: z.array(z.string()),
    providerName: z.string().nullable(),
    iban: z.string().nullable(),
    kind: accountKindSchema.nullable(),
    purpose: accountPurposeSchema.nullable(),
    status: accountStatusSchema.nullable(),
    currency: z.string().length(3).nullable(),
    balance: z.number().nullable(),
    balanceAsOf: z.iso.datetime().nullable(),
    overdraftLimit: z.number().nonnegative().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: 'Account' });

export type Account = z.infer<typeof accountSchema>;
