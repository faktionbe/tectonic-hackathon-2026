import { z } from 'zod';

import { accountSchema } from './account';
import { expenseSchema } from './expense';
import {
  linkedAccountSummarySchema,
  linkedPartySummarySchema,
} from './expense-read';
import { partySchema } from './party';
import { subscriptionSchema } from './subscription';

/** Subscription row plus the account and payee it belongs to. */
export const subscriptionListItemSchema = subscriptionSchema
  .extend({
    account: linkedAccountSummarySchema,
    counterparty: linkedPartySummarySchema,
  })
  .meta({ id: 'SubscriptionListItem' });

export type SubscriptionListItem = z.infer<typeof subscriptionListItemSchema>;

/** Subscription with its account, payee and the charges posted against it. */
export const subscriptionDetailSchema = subscriptionSchema
  .extend({
    account: accountSchema,
    counterparty: partySchema,
    expenses: z.array(expenseSchema),
  })
  .meta({ id: 'SubscriptionDetail' });

export type SubscriptionDetail = z.infer<typeof subscriptionDetailSchema>;
