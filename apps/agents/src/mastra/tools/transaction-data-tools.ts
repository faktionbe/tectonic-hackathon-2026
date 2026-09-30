import { createTool } from '@mastra/core/tools';
import {
  expenseSchema,
  partySchema,
  subscriptionSchema,
} from '@repo/contracts';
import { z } from 'zod';

import { computeExpenseMetrics } from '../expense-analysis/metrics';
import {
  filterExpensesByPeriod,
  getMockTransactionDataset,
} from '../expense-analysis/mock-transaction-data';
import { analysisPeriodSchema } from '../schemas/expense-analysis';

const customerIdSchema = z.object({
  customerId: z.string().min(1).describe('Customer identifier'),
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

export const fetchExpensesTool = createTool({
  id: 'fetch_expenses',
  description:
    'Fetch a customer expense dataset. Mocked until a database tool replaces this execute function.',
  inputSchema: periodInputSchema,
  outputSchema: z.object({
    expenses: z.array(expenseSchema),
  }),
  execute: async ({ customerId, period }) => {
    const dataset = getMockTransactionDataset(customerId);
    const expenses = z
      .array(expenseSchema)
      .parse(filterExpensesByPeriod(dataset.expenses, period));

    return { expenses };
  },
});

export const fetchPartiesTool = createTool({
  id: 'fetch_parties',
  description:
    'Fetch counterparties for a customer. Mocked until a database tool replaces this execute function.',
  inputSchema: customerIdSchema,
  outputSchema: z.object({
    parties: z.array(partySchema),
  }),
  execute: async ({ customerId }) => {
    const dataset = getMockTransactionDataset(customerId);

    return {
      parties: z.array(partySchema).parse(dataset.parties),
    };
  },
});

export const fetchSubscriptionsTool = createTool({
  id: 'fetch_subscriptions',
  description:
    'Fetch recurring subscriptions for a customer. Mocked until a database tool replaces this execute function.',
  inputSchema: customerIdSchema,
  outputSchema: z.object({
    subscriptions: z.array(subscriptionSchema),
  }),
  execute: async ({ customerId }) => {
    const dataset = getMockTransactionDataset(customerId);

    return {
      subscriptions: z.array(subscriptionSchema).parse(dataset.subscriptions),
    };
  },
});

export const computeExpenseMetricsTool = createTool({
  id: 'compute_expense_metrics',
  description:
    'Compute deterministic expense metrics for a customer from the same mock transaction store. Trust these numbers instead of recalculating them.',
  inputSchema: periodInputSchema.extend({
    homeCountryCode: z
      .string()
      .length(2)
      .optional()
      .describe(
        'ISO country code treated as home. Defaults to the stored value.'
      ),
  }),
  outputSchema: z.object({
    period: analysisPeriodSchema,
    metrics: z.unknown(),
  }),
  execute: async ({ customerId, period, homeCountryCode }) => {
    const dataset = getMockTransactionDataset(customerId);
    const expenses = filterExpensesByPeriod(dataset.expenses, period);
    const metrics = computeExpenseMetrics({
      expenses,
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
