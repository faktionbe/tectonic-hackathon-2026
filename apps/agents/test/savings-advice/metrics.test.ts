import { describe, expect, it } from 'vitest';

import { computeSavingsAdviceMetrics } from '../../src/mastra/savings-advice/metrics';

describe('computeSavingsAdviceMetrics', () => {
  it('computes surplus, savings rate, and coverage from aggregates', () => {
    const metrics = computeSavingsAdviceMetrics({
      monthlyIncome: 4000,
      monthlyExpenses: 3000,
      currentSavings: 9000,
    });

    expect(metrics.totalIncome).toBe(4000);
    expect(metrics.totalExpenses).toBe(3000);
    expect(metrics.monthlySurplus).toBe(1000);
    expect(metrics.savingsRate).toBe(0.25);
    expect(metrics.savingsExpenseCoverageMonths).toBe(3);
    expect(metrics.dataSufficiency.hasIncome).toBe(true);
    expect(metrics.dataSufficiency.hasExpenses).toBe(true);
    expect(metrics.dataSufficiency.usedExpenseLines).toBe(false);
  });

  it('returns null savings rate when income is zero', () => {
    const metrics = computeSavingsAdviceMetrics({
      monthlyIncome: 0,
      monthlyExpenses: 500,
      currentSavings: 1000,
    });

    expect(metrics.savingsRate).toBeNull();
    expect(metrics.monthlySurplus).toBe(-500);
    expect(metrics.savingsExpenseCoverageMonths).toBe(2);
  });

  it('returns null coverage when expenses are zero', () => {
    const metrics = computeSavingsAdviceMetrics({
      monthlyIncome: 2000,
      monthlyExpenses: 0,
      currentSavings: 5000,
    });

    expect(metrics.savingsExpenseCoverageMonths).toBeNull();
    expect(metrics.savingsRate).toBe(1);
  });

  it('derives monthly income and expenses from expense lines', () => {
    const metrics = computeSavingsAdviceMetrics({
      currentSavings: 2000,
      periodMonths: 2,
      expenseLines: [
        {
          id: 'c1',
          accountId: 'acc_1',
          amount: 4000,
          currency: 'EUR',
          direction: 'CREDIT',
          bookingDate: '2026-01-01',
          type: 'SEPA_CREDIT_TRANSFER',
          status: 'BOOKED',
        },
        {
          id: 'd1',
          accountId: 'acc_1',
          amount: 1500,
          currency: 'EUR',
          direction: 'DEBIT',
          bookingDate: '2026-01-05',
          type: 'CARD_PAYMENT',
          status: 'BOOKED',
        },
        {
          id: 'd2',
          accountId: 'acc_1',
          amount: 1500,
          currency: 'EUR',
          direction: 'DEBIT',
          bookingDate: '2026-02-05',
          type: 'CARD_PAYMENT',
          status: 'BOOKED',
        },
      ],
    });

    expect(metrics.dataSufficiency.usedExpenseLines).toBe(true);
    expect(metrics.totalIncome).toBe(2000);
    expect(metrics.totalExpenses).toBe(1500);
    expect(metrics.monthlySurplus).toBe(500);
  });

  it('sums investment allocation when provided', () => {
    const metrics = computeSavingsAdviceMetrics({
      monthlyIncome: 3000,
      monthlyExpenses: 2000,
      currentSavings: 5000,
      investmentAllocation: [
        { label: 'funds', amount: 10_000, currency: 'EUR' },
        { label: 'pension', amount: 5_000, currency: 'EUR' },
      ],
    });

    expect(metrics.investmentAllocationTotal).toBe(15_000);
  });
});
