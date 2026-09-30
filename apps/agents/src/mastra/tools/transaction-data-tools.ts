import { createTool } from '@mastra/core/tools';
import {
  type Expense,
  expenseSchema,
  type Party,
  partySchema,
  type ProfileDetail,
  type Subscription,
  subscriptionSchema,
} from '@repo/contracts';
import { z } from 'zod';

import { computeExpenseMetrics } from '../expense-analysis/metrics';
import { analysisPeriodSchema } from '../schemas/expense-analysis';
import {
  type AnalysisPeriod,
  listExpenses,
  listParties,
  listSubscriptions,
  loadCustomerAccounts,
} from '../server-api/customer-api';

const customerIdSchema = z.object({
  customerId: z
    .string()
    .min(1)
    .describe('Profile id (Nest GET /profiles/:profileId)'),
});

const periodInputSchema = customerIdSchema.extend({
  period: analysisPeriodSchema
    .optional()
    .describe('Optional inclusive booking-date window'),
});

export const EXPENSE_ANALYSIS_TOOL_IDS = [
  'fetch_expenses',
  'fetch_parties',
  'fetch_subscriptions',
  'compute_expense_metrics',
] as const;

export interface TransactionDataset {
  profile: ProfileDetail;
  homeCountryCode?: string;
  expenses: Array<Expense>;
  parties: Array<Party>;
  subscriptions: Array<Subscription>;
}

function collectCounterpartyIds(
  expenses: Array<Expense>,
  subscriptions: Array<Subscription>
): Array<string> {
  const ids = new Set<string>();
  for (const expense of expenses) {
    if (expense.counterpartyId) {
      ids.add(expense.counterpartyId);
    }
  }
  for (const subscription of subscriptions) {
    ids.add(subscription.counterpartyId);
  }
  return [...ids];
}

export async function loadTransactionDataset(
  customerId: string,
  period?: AnalysisPeriod
): Promise<TransactionDataset> {
  const { profile, accountIds } = await loadCustomerAccounts(customerId);
  const [expenses, subscriptions] = await Promise.all([
    listExpenses({ accountIds, period }),
    listSubscriptions({ accountIds }),
  ]);
  const partyIds = collectCounterpartyIds(expenses, subscriptions);
  const parties =
    partyIds.length > 0 ? await listParties({ ids: partyIds }) : [];

  const dataset: TransactionDataset = {
    profile,
    expenses,
    parties,
    subscriptions,
  };

  if (profile.country !== null && profile.country.length === 2) {
    dataset.homeCountryCode = profile.country;
  }

  return dataset;
}

export const fetchExpensesTool = createTool({
  id: 'fetch_expenses',
  description:
    'Fetch expense lines for a customer. customerId is the Nest profile id. Optionally filter by inclusive booking-date window.',
  inputSchema: periodInputSchema,
  outputSchema: z.object({
    expenses: z.array(expenseSchema),
  }),
  execute: async ({ customerId, period }) => {
    const dataset = await loadTransactionDataset(customerId, period);
    return {
      expenses: z.array(expenseSchema).parse(dataset.expenses),
    };
  },
});

export const fetchPartiesTool = createTool({
  id: 'fetch_parties',
  description:
    "Fetch counterparties referenced by a customer's expenses and subscriptions. customerId is the Nest profile id.",
  inputSchema: customerIdSchema,
  outputSchema: z.object({
    parties: z.array(partySchema),
  }),
  execute: async ({ customerId }) => {
    const dataset = await loadTransactionDataset(customerId);
    return {
      parties: z.array(partySchema).parse(dataset.parties),
    };
  },
});

export const fetchSubscriptionsTool = createTool({
  id: 'fetch_subscriptions',
  description:
    'Fetch recurring subscriptions for a customer. customerId is the Nest profile id.',
  inputSchema: customerIdSchema,
  outputSchema: z.object({
    subscriptions: z.array(subscriptionSchema),
  }),
  execute: async ({ customerId }) => {
    const dataset = await loadTransactionDataset(customerId);
    return {
      subscriptions: z.array(subscriptionSchema).parse(dataset.subscriptions),
    };
  },
});

export const computeExpenseMetricsTool = createTool({
  id: 'compute_expense_metrics',
  description:
    'Compute deterministic expense metrics for a customer from Nest API data. Trust these numbers instead of recalculating them. customerId is the Nest profile id.',
  inputSchema: periodInputSchema.extend({
    homeCountryCode: z
      .string()
      .length(2)
      .optional()
      .describe(
        'ISO country code treated as home. Defaults to the profile country when set.'
      ),
  }),
  outputSchema: z.object({
    period: analysisPeriodSchema,
    metrics: z.unknown(),
  }),
  execute: async ({ customerId, period, homeCountryCode }) => {
    const dataset = await loadTransactionDataset(customerId, period);
    const metrics = computeExpenseMetrics({
      expenses: dataset.expenses,
      parties: dataset.parties,
      subscriptions: dataset.subscriptions,
      period,
      homeCountryCode: homeCountryCode ?? dataset.homeCountryCode,
    });

    return {
      period: metrics.period,
      metrics,
    };
  },
});
