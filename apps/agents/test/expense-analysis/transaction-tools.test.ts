import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { TRANSACTION_CUSTOMER_IDS } from '../../src/mastra/expense-analysis/mock-transaction-data';
import { spendingAnomalyFixture } from '../../src/mastra/expense-analysis/transaction-fixtures';
import {
  computeExpenseMetricsTool,
  fetchExpensesTool,
  fetchPartiesTool,
  fetchSubscriptionsTool,
} from '../../src/mastra/tools/transaction-data-tools';

async function execute<TInput, TResult>(
  tool: {
    execute?: (input: TInput, context: never) => Promise<TResult>;
  },
  input: TInput
): Promise<TResult> {
  if (!tool.execute) {
    throw new Error('Tool is missing execute');
  }

  return tool.execute(input, undefined as never);
}

describe('transaction data tools', () => {
  it('returns the spending-anomaly expenses for a known customer id', async () => {
    const result = z
      .object({
        expenses: z.array(z.object({ id: z.string() })),
      })
      .parse(
        await execute(fetchExpensesTool, {
          customerId: TRANSACTION_CUSTOMER_IDS.spendingAnomaly,
        })
      );

    expect(result.expenses.map((expense) => expense.id)).toEqual(
      spendingAnomalyFixture.expenses.map((expense) => expense.id)
    );
  });

  it('filters expenses to the requested period', async () => {
    const result = z
      .object({
        expenses: z.array(z.object({ id: z.string() })),
      })
      .parse(
        await execute(fetchExpensesTool, {
          customerId: TRANSACTION_CUSTOMER_IDS.spendingAnomaly,
          period: { start: '2026-02-01', end: '2026-02-28' },
        })
      );

    expect(result.expenses).toEqual([]);
  });

  it('returns parties for a known customer id', async () => {
    const result = z
      .object({
        parties: z.array(z.object({ id: z.string() })),
      })
      .parse(
        await execute(fetchPartiesTool, {
          customerId: TRANSACTION_CUSTOMER_IDS.travel,
        })
      );

    expect(result.parties.map((party) => party.id)).toContain('party_hotel');
  });

  it('returns subscriptions for a known customer id', async () => {
    const result = z
      .object({
        subscriptions: z.array(z.object({ id: z.string() })),
      })
      .parse(
        await execute(fetchSubscriptionsTool, {
          customerId: TRANSACTION_CUSTOMER_IDS.carPurchase,
        })
      );

    expect(result.subscriptions.map((subscription) => subscription.id)).toEqual(
      ['sub_auto_ins', 'sub_auto_loan']
    );
  });

  it('computes metrics from the same mock store', async () => {
    const result = z
      .object({
        period: z.object({ start: z.string(), end: z.string() }),
        metrics: z.object({ expenseCount: z.number() }),
      })
      .parse(
        await execute(computeExpenseMetricsTool, {
          customerId: TRANSACTION_CUSTOMER_IDS.spendingAnomaly,
          homeCountryCode: 'BE',
        })
      );

    expect(result.period).toEqual({
      start: '2026-01-05',
      end: '2026-01-30',
    });
    expect(result.metrics.expenseCount).toBe(
      spendingAnomalyFixture.expenses.length
    );
  });

  it('throws for an unknown customer id', async () => {
    await expect(
      execute(fetchExpensesTool, { customerId: 'customer_missing' })
    ).rejects.toThrow(
      'No mock transaction data for customerId=customer_missing'
    );
  });
});
