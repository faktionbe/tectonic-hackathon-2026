import { z } from 'zod';

export const creditCardSchema = z
  .object({
    id: z.string(),
    holderIds: z.array(z.string()),
    providerName: z.string().nullable(),
    productName: z.string().nullable(),
    currency: z.string().length(3).nullable(),
    creditLimit: z.number().nonnegative().nullable(),
    usedCredit: z.number().nonnegative().nullable(),
    billingAccountId: z.string().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: 'CreditCard' });

export type CreditCard = z.infer<typeof creditCardSchema>;
