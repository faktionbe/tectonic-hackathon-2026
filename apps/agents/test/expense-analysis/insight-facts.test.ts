import { describe, expect, it } from 'vitest';

import { repairExpenseAnalysis } from '../../src/mastra/expense-analysis/analyze';
import { attachInsightFacts } from '../../src/mastra/expense-analysis/insight-facts';
import { computeExpenseMetrics } from '../../src/mastra/expense-analysis/metrics';
import {
  lifestyleChangeFixture,
  travelFixture,
} from '../../src/mastra/expense-analysis/transaction-fixtures';
import { expenseMetricsSchema } from '../../src/mastra/schemas/expense-metrics';
import { groundedExpenseAnalysisSchema } from '../../src/mastra/schemas/financial-insight';

describe('attachInsightFacts', () => {
  it('attaches the dining comparison and the restaurant example', () => {
    const metrics = expenseMetricsSchema.parse(
      computeExpenseMetrics(lifestyleChangeFixture)
    );
    const knownIds = new Set(
      lifestyleChangeFixture.expenses.map((expense) => expense.id)
    );
    const repaired = repairExpenseAnalysis(
      {
        useCases: {
          large_lifestyle_change: {
            status: 'detected',
            confidence: 0.9,
            summary: 'Dining rose.',
            evidence: [
              {
                transactionIds: ['tx_ls_jan_1'],
                explanation: 'January dining is higher.',
              },
            ],
          },
        },
      },
      metrics.period,
      knownIds
    );

    const grounded = attachInsightFacts(repaired, {
      expenses: lifestyleChangeFixture.expenses,
      parties: lifestyleChangeFixture.parties ?? [],
      metrics,
    });
    const facts = grounded.factsByLabel.large_lifestyle_change;

    expect(facts?.lifestyle?.category).toBe('DINING');
    expect(facts?.examples[0]?.counterparty).toBe('Restaurant Belga');
    expect(facts?.examples[0]?.amount).toBe(180);
    expect(facts?.lines.join(' ')).toMatch(/€/u);
    expect(facts?.lifestyle?.laterMonthlyAverage).toBeGreaterThan(
      facts?.lifestyle?.earlierMonthlyAverage ?? 0
    );
    expect(groundedExpenseAnalysisSchema.safeParse(grounded).success).toBe(
      true
    );
  });

  it('accepts travel metrics used for country totals', () => {
    const metrics = expenseMetricsSchema.parse(
      computeExpenseMetrics(travelFixture)
    );

    expect(metrics.foreignCountryExpenses.length).toBeGreaterThan(0);
    expect(
      metrics.foreignCountryExpenses.every(
        (item) => item.bookingDate.length > 0
      )
    ).toBe(true);
  });
});
