import { z } from 'zod';

import { accountStatusSchema } from './account';
import { expenseCadenceSchema } from './expense';

export const investmentKindSchema = z.enum([
  'FUND_PORTFOLIO',
  'PENSION_SAVINGS',
  'OTHER',
]);

export type InvestmentKind = z.infer<typeof investmentKindSchema>;

export const investmentSchema = z
  .object({
    id: z.string(),
    holderIds: z.array(z.string()),
    providerName: z.string().nullable(),
    productName: z.string().nullable(),
    kind: investmentKindSchema.nullable(),
    currency: z.string().length(3).nullable(),
    currentValue: z.number().nonnegative().nullable(),
    valuationDate: z.iso.date().nullable(),
    contributionAmount: z.number().nonnegative().nullable(),
    contributionCadence: expenseCadenceSchema.nullable(),
    status: accountStatusSchema.nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: 'Investment' });

export type Investment = z.infer<typeof investmentSchema>;
