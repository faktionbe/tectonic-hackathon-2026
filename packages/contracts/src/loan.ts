import { z } from 'zod';

import { expenseCadenceSchema } from './expense';

export const loanKindSchema = z.enum(['MORTGAGE', 'OTHER']);

export type LoanKind = z.infer<typeof loanKindSchema>;

export const loanSchema = z
  .object({
    id: z.string(),
    borrowerIds: z.array(z.string()),
    providerName: z.string().nullable(),
    productName: z.string().nullable(),
    kind: loanKindSchema.nullable(),
    currency: z.string().length(3).nullable(),
    outstandingBalance: z.number().nonnegative().nullable(),
    repaymentAmount: z.number().nonnegative().nullable(),
    repaymentCadence: expenseCadenceSchema.nullable(),
    remainingTermMonths: z.number().int().nonnegative().nullable(),
    repaymentAccountId: z.string().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: 'Loan' });

export type Loan = z.infer<typeof loanSchema>;
