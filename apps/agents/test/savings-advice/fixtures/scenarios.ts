import {
  getMockCustomerInput,
  MOCK_CUSTOMERS,
} from '../../fixtures/mock-customer-data';
import type { SavingsAdviceInput } from '../../../src/mastra/schemas/savings-advice';

export const CUSTOMER_IDS = {
  thinBuffer: 'customer_thin_buffer',
  readyToInvest: 'customer_ready_to_invest',
  gradualInvest: 'customer_gradual_invest',
  highLiquidity: 'customer_high_liquidity',
  stayTheCourse: 'customer_stay_the_course',
  insufficientData: 'customer_insufficient_data',
  weakSavingsRate: 'customer_weak_savings_rate',
} as const;

function requireMock(customerId: string): SavingsAdviceInput {
  const match = MOCK_CUSTOMERS[customerId];
  if (!match) {
    throw new Error(`Missing mock customer fixture: ${customerId}`);
  }
  return match;
}

export const thinBufferFixture: SavingsAdviceInput = requireMock(
  CUSTOMER_IDS.thinBuffer
);

export const readyToInvestFixture: SavingsAdviceInput = requireMock(
  CUSTOMER_IDS.readyToInvest
);

export const gradualInvestFixture: SavingsAdviceInput = requireMock(
  CUSTOMER_IDS.gradualInvest
);

export const highLiquidityFixture: SavingsAdviceInput = requireMock(
  CUSTOMER_IDS.highLiquidity
);

export const stayTheCourseFixture: SavingsAdviceInput = requireMock(
  CUSTOMER_IDS.stayTheCourse
);

export const insufficientDataFixture: SavingsAdviceInput = requireMock(
  CUSTOMER_IDS.insufficientData
);

export const weakSavingsRateFixture: SavingsAdviceInput = requireMock(
  CUSTOMER_IDS.weakSavingsRate
);

export { getMockCustomerInput };
