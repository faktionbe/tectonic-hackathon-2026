import { config } from 'dotenv';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

import { expenseInsightAgent } from '../../src/mastra/agents/expense-insight-agent';
import { analyzeExpenses } from '../../src/mastra/expense-analysis/analyze-expenses';
import { TRANSACTION_CUSTOMER_IDS } from '../../src/mastra/expense-analysis/mock-transaction-data';
import type { UseCaseLabel } from '../../src/mastra/schemas/expense-analysis';

config({ path: resolve(process.cwd(), '.env') });

const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY;

async function expectDetected(
  customerId: string,
  label: UseCaseLabel
): Promise<void> {
  const result = await analyzeExpenses({ customerId }, expenseInsightAgent);
  const useCase = result.useCases.find((item) => item.label === label);

  expect(useCase, `Expected use case ${label} to be present`).toBeDefined();
  if (!useCase) {
    return;
  }

  expect(useCase.status).toBe('detected');
  expect(useCase.confidence).toBeGreaterThan(0);
  expect(useCase.evidence.length).toBeGreaterThan(0);
  expect(useCase.evidence.every((item) => item.transactionIds.length > 0)).toBe(
    true
  );
}

describe.skipIf(!hasOpenRouterKey)('expense analysis live LLM', () => {
  beforeAll(() => {
    if (!hasOpenRouterKey) {
      throw new Error('OPENROUTER_API_KEY is required for live tests');
    }
  });

  it('detects spending_anomaly', async () => {
    await expectDetected(
      TRANSACTION_CUSTOMER_IDS.spendingAnomaly,
      'spending_anomaly'
    );
  });

  it('detects travel_detected', async () => {
    await expectDetected(TRANSACTION_CUSTOMER_IDS.travel, 'travel_detected');
  });

  it('detects large_lifestyle_change', async () => {
    await expectDetected(
      TRANSACTION_CUSTOMER_IDS.lifestyleChange,
      'large_lifestyle_change'
    );
  });

  it('detects life_event_job_change', async () => {
    await expectDetected(
      TRANSACTION_CUSTOMER_IDS.jobChange,
      'life_event_job_change'
    );
  });

  it('detects life_event_buying_car', async () => {
    await expectDetected(
      TRANSACTION_CUSTOMER_IDS.carPurchase,
      'life_event_buying_car'
    );
  });

  it('detects life_event_buying_home', async () => {
    await expectDetected(
      TRANSACTION_CUSTOMER_IDS.homePurchase,
      'life_event_buying_home'
    );
  });

  it('detects financial_stress_signals', async () => {
    await expectDetected(
      TRANSACTION_CUSTOMER_IDS.financialStress,
      'financial_stress_signals'
    );
  });

  it('detects unhealthy_lifestyle', async () => {
    await expectDetected(
      TRANSACTION_CUSTOMER_IDS.unhealthyLifestyle,
      'unhealthy_lifestyle'
    );
  });

  it('returns insufficient_data where comparison or geo data is missing', async () => {
    const result = await analyzeExpenses(
      { customerId: TRANSACTION_CUSTOMER_IDS.insufficientData },
      expenseInsightAgent
    );

    const lifestyle = result.useCases.find(
      (item) => item.label === 'large_lifestyle_change'
    );
    const travel = result.useCases.find(
      (item) => item.label === 'travel_detected'
    );

    expect(lifestyle?.status).toBe('insufficient_data');
    expect(travel?.status).toBe('insufficient_data');
  });
});
