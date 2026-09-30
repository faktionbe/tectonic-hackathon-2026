import { z } from 'zod';

import { expenseCadenceSchema, expenseCategorySchema } from './expense';

export const subscriptionKindSchema = z.enum([
  'DIRECT_DEBIT',
  'STANDING_ORDER',
]);

export type SubscriptionKind = z.infer<typeof subscriptionKindSchema>;

export const subscriptionStatusSchema = z.enum([
  'ACTIVE',
  'PAUSED',
  'CANCELLED',
]);

export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

/**
 * A recurring payment: a Belgian domiciliëring (DIRECT_DEBIT — creditor pulls)
 * or a doorlopende opdracht (STANDING_ORDER — you push). Holds the recurrence
 * lifecycle; individual charges are Expense lines referencing this via
 * `subscriptionId`.
 */
export const subscriptionSchema = z
  .object({
    id: z.string(),
    accountId: z.string(),
    counterpartyId: z
      .string()
      .meta({ description: 'The payee Party (merchant/creditor being paid)' }),

    kind: subscriptionKindSchema,
    mandateId: z
      .string()
      .optional()
      .meta({ description: 'SEPA mandate reference' }),
    creditorId: z
      .string()
      .optional()
      .meta({ description: 'Stable SEPA creditor key' }),

    status: subscriptionStatusSchema,
    category: expenseCategorySchema.optional(),
    cadence: expenseCadenceSchema,

    amount: z
      .number()
      .positive()
      .meta({ description: 'Expected/typical charge amount' }),
    currency: z.string().length(3).meta({ description: 'ISO 4217 code' }),

    nextPaymentDate: z.iso.date().optional(),
    firstChargedAt: z.iso.date().optional(),
    lastChargedAt: z.iso.date().optional(),
    occurrenceCount: z.number().int().nonnegative().optional(),
    cancellable: z
      .boolean()
      .optional()
      .meta({ description: 'Can KBC offer a cancel/switch action?' }),
  })
  .meta({ id: 'Subscription' });

export type Subscription = z.infer<typeof subscriptionSchema>;
