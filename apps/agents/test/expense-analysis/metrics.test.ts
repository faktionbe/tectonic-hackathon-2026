import { describe, expect, it } from 'vitest';

import { computeExpenseMetrics } from '../../src/mastra/expense-analysis/metrics';

import {
  lifestyleChangeFixture,
  spendingAnomalyFixture,
  travelFixture,
} from './fixtures/scenarios';

describe('computeExpenseMetrics', () => {
  it('flags large debit outliers', () => {
    const metrics = computeExpenseMetrics(spendingAnomalyFixture);
    const outlierIds = metrics.largeOutliers.map((item) => item.expenseId);

    expect(outlierIds).toContain('tx_sa_6');
    expect(metrics.debitAverage).not.toBeNull();
    expect(metrics.debitAverage).toBeLessThan(500);
  });

  it('detects foreign-country expenses versus home country', () => {
    const metrics = computeExpenseMetrics(travelFixture);

    expect(metrics.dataSufficiency.hasGeoData).toBe(true);
    expect(metrics.foreignCountryExpenses.length).toBeGreaterThanOrEqual(3);
    expect(
      metrics.foreignCountryExpenses.every((item) => item.countryCode === 'ES')
    ).toBe(true);
  });

  it('computes dining category increases across halves of the period', () => {
    const metrics = computeExpenseMetrics(lifestyleChangeFixture);
    const dining = metrics.categoryChanges.find(
      (change) => change.category === 'DINING'
    );

    expect(metrics.dataSufficiency.hasMultiMonthHistory).toBe(true);
    expect(dining).toBeDefined();
    if (!dining) {
      return;
    }

    expect(dining.laterMonthlyAverage).toBeGreaterThan(
      dining.earlierMonthlyAverage * 2
    );
  });
});
