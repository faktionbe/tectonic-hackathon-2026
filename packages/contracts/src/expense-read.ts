import { z } from 'zod';

import { accountSchema } from './account';
import { expenseSchema } from './expense';
import { partySchema } from './party';
import { subscriptionSchema } from './subscription';

/** Account facts needed to place an expense or subscription in a list. */
export const linkedAccountSummarySchema = accountSchema
  .pick({
    id: true,
    providerName: true,
    iban: true,
    kind: true,
    currency: true,
    status: true,
  })
  .meta({ id: 'LinkedAccountSummary' });

export type LinkedAccountSummary = z.infer<typeof linkedAccountSummarySchema>;

/** Counterparty facts needed to label an expense or subscription in a list. */
export const linkedPartySummarySchema = partySchema
  .pick({
    id: true,
    kind: true,
    name: true,
    category: true,
  })
  .meta({ id: 'LinkedPartySummary' });

export type LinkedPartySummary = z.infer<typeof linkedPartySummarySchema>;

/** Subscription facts needed to label a charge in a list. */
export const linkedSubscriptionSummarySchema = subscriptionSchema
  .pick({
    id: true,
    kind: true,
    status: true,
    category: true,
    cadence: true,
    amount: true,
    currency: true,
  })
  .meta({ id: 'LinkedSubscriptionSummary' });

export type LinkedSubscriptionSummary = z.infer<
  typeof linkedSubscriptionSummarySchema
>;

/** Expense row plus the account, counterparty and subscription it belongs to. */
export const expenseListItemSchema = expenseSchema
  .extend({
    account: linkedAccountSummarySchema,
    counterparty: linkedPartySummarySchema.nullable(),
    subscription: linkedSubscriptionSummarySchema.nullable(),
  })
  .meta({ id: 'ExpenseListItem' });

export type ExpenseListItem = z.infer<typeof expenseListItemSchema>;

/**
 * Expense with the records its foreign keys point at.
 * Related expenses are the lines that reference this one as their original.
 */
export const expenseDetailSchema = expenseSchema
  .extend({
    account: accountSchema,
    counterparty: partySchema.nullable(),
    counterpartyAccount: accountSchema.nullable(),
    subscription: subscriptionSchema.nullable(),
    originalExpense: expenseSchema.nullable(),
    relatedExpenses: z.array(expenseSchema),
  })
  .meta({ id: 'ExpenseDetail' });

export type ExpenseDetail = z.infer<typeof expenseDetailSchema>;
