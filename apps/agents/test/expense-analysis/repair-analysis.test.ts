import { describe, expect, it } from 'vitest';

import { repairExpenseAnalysis } from '../../src/mastra/expense-analysis/analyze';
import { USE_CASE_LABELS } from '../../src/mastra/schemas/expense-analysis';

const period = { start: '2026-01-01', end: '2026-03-31' };

function detected(transactionIds: Array<string>) {
  return {
    status: 'detected',
    confidence: 0.8,
    summary: 'A pattern is visible.',
    evidence: [
      {
        transactionIds,
        explanation: 'These transactions support the pattern.',
      },
    ],
  };
}

describe('repairExpenseAnalysis', () => {
  it('fills a missing label and drops invented transaction ids', () => {
    const result = repairExpenseAnalysis(
      {
        useCases: {
          spending_anomaly: detected(['tx_real', 'tx_fake']),
        },
      },
      period,
      new Set(['tx_real'])
    );

    expect(result.useCases).toHaveLength(USE_CASE_LABELS.length);
    expect(result.useCases.map((useCase) => useCase.label)).toEqual([
      ...USE_CASE_LABELS,
    ]);
    expect(result.period).toEqual(period);

    const anomaly = result.useCases.find(
      (useCase) => useCase.label === 'spending_anomaly'
    );
    expect(anomaly?.status).toBe('detected');
    expect(anomaly?.evidence[0]?.transactionIds).toEqual(['tx_real']);

    const travel = result.useCases.find(
      (useCase) => useCase.label === 'travel_detected'
    );
    expect(travel?.status).toBe('insufficient_data');
    expect(travel?.evidence).toEqual([]);
  });

  it('downgrades a detected label when every transaction id is unknown', () => {
    const result = repairExpenseAnalysis(
      {
        useCases: {
          travel_detected: detected(['tx_missing']),
        },
      },
      period,
      new Set(['tx_real'])
    );

    const travel = result.useCases.find(
      (useCase) => useCase.label === 'travel_detected'
    );
    expect(travel?.status).toBe('insufficient_data');
    expect(travel?.evidence).toEqual([]);
  });
});
