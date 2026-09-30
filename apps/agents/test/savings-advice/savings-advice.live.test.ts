import { getProducts } from '@repo/kbc-products';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

import { savingsAdviceAgent } from '../../src/mastra/agents/savings-advice-agent';
import { getMockCustomerInput } from '../../src/mastra/savings-advice/mock-customer-data';
import { runSavingsAdviceForCustomer } from '../../src/mastra/savings-advice/run-for-customer';
import type { AdviceStrategy } from '../../src/mastra/schemas/savings-advice';

import { CUSTOMER_IDS } from './fixtures/scenarios';

config({ path: resolve(process.cwd(), '.env') });

const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY;

const catalogueIds = new Set(
  getProducts(['saving', 'investing']).map((product) => product.id)
);

async function expectStrategyIn(
  customerId: string,
  expected: Array<AdviceStrategy>
): Promise<void> {
  const expectedInput = getMockCustomerInput(customerId);
  const result = await runSavingsAdviceForCustomer(
    customerId,
    savingsAdviceAgent
  );

  expect(expected).toContain(result.primaryStrategy);
  expect(result.adviceStatement.trim().length).toBeGreaterThan(0);
  expect(result.literacyLevelUsed).toBe(
    expectedInput.profile.financialLiteracy
  );
  expect(result.relevantProductIds.every((id) => catalogueIds.has(id))).toBe(
    true
  );
  expect(result.confidence).toBeGreaterThanOrEqual(0);
  expect(result.confidence).toBeLessThanOrEqual(1);
  expect(result.supportingNumbers.currentSavings).toBe(
    expectedInput.finances.currentSavings
  );
}

describe.skipIf(!hasOpenRouterKey)('savings advice live LLM (A2A path)', () => {
  beforeAll(() => {
    if (!hasOpenRouterKey) {
      throw new Error('OPENROUTER_API_KEY is required for live tests');
    }
  });

  it('selects build_emergency_buffer for a thin buffer', async () => {
    await expectStrategyIn(CUSTOMER_IDS.thinBuffer, ['build_emergency_buffer']);
  });

  it('selects start_investing or invest_gradually when buffer is solid', async () => {
    await expectStrategyIn(CUSTOMER_IDS.readyToInvest, [
      'start_investing',
      'invest_gradually',
    ]);
  });

  it('selects invest_gradually for beginner with solid buffer', async () => {
    await expectStrategyIn(CUSTOMER_IDS.gradualInvest, [
      'invest_gradually',
      'start_investing',
      'build_emergency_buffer',
    ]);
  });

  it('selects preserve_liquidity for high near-term liquidity needs', async () => {
    await expectStrategyIn(CUSTOMER_IDS.highLiquidity, [
      'preserve_liquidity',
      'build_emergency_buffer',
      'stay_the_course',
    ]);
  });

  it('selects stay_the_course for a sound diversified profile', async () => {
    await expectStrategyIn(CUSTOMER_IDS.stayTheCourse, [
      'stay_the_course',
      'optimize_existing_products',
      'pension_planning',
    ]);
  });

  it('selects insufficient_data when finances are empty', async () => {
    await expectStrategyIn(CUSTOMER_IDS.insufficientData, [
      'insufficient_data',
    ]);
  });
});
