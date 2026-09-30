import type { SavingsAdviceInput } from '../schemas/savings-advice';

function baseProfile(
  overrides: Partial<SavingsAdviceInput['profile']> = {}
): SavingsAdviceInput['profile'] {
  return {
    financialLiteracy: 'intermediate',
    riskTolerance: 'medium',
    goals: ['build wealth'],
    investmentHorizon: 'medium',
    liquidityNeeds: 'medium',
    ageCategory: '30_45',
    ...overrides,
  };
}

/**
 * Deterministic mock customers used when real customer-data APIs are unavailable.
 * Customer ids are stable so A2A callers and live tests share the same fixtures.
 */
export const MOCK_CUSTOMERS: Record<string, SavingsAdviceInput> = {
  customer_thin_buffer: {
    profile: baseProfile({
      financialLiteracy: 'beginner',
      riskTolerance: 'low',
      goals: ['have a safety net'],
      investmentHorizon: 'short',
      liquidityNeeds: 'high',
    }),
    existingProducts: [],
    finances: {
      monthlyIncome: 2800,
      monthlyExpenses: 2600,
      currentSavings: 1500,
    },
  },
  customer_ready_to_invest: {
    profile: baseProfile({
      financialLiteracy: 'intermediate',
      riskTolerance: 'medium',
      goals: ['grow wealth over time'],
      investmentHorizon: 'long',
      liquidityNeeds: 'low',
    }),
    existingProducts: [
      {
        productId: 'savings-account',
        productType: 'saving',
        amountHeld: 18_000,
        currency: 'EUR',
        characteristics: 'Emergency buffer',
      },
    ],
    finances: {
      monthlyIncome: 4200,
      monthlyExpenses: 2800,
      currentSavings: 18_000,
      investmentAllocation: [],
    },
  },
  customer_gradual_invest: {
    profile: baseProfile({
      financialLiteracy: 'beginner',
      riskTolerance: 'low',
      goals: ['start investing carefully'],
      investmentHorizon: 'medium',
      liquidityNeeds: 'medium',
    }),
    existingProducts: [
      {
        productId: 'savings-account',
        amountHeld: 12_000,
        currency: 'EUR',
      },
    ],
    finances: {
      monthlyIncome: 3500,
      monthlyExpenses: 2400,
      currentSavings: 12_000,
    },
  },
  customer_high_liquidity: {
    profile: baseProfile({
      financialLiteracy: 'intermediate',
      riskTolerance: 'medium',
      goals: ['buy a home in 12 months'],
      investmentHorizon: 'short',
      liquidityNeeds: 'high',
      ageCategory: '30_45',
    }),
    existingProducts: [
      {
        productId: 'savings-account',
        amountHeld: 25_000,
        currency: 'EUR',
      },
    ],
    finances: {
      monthlyIncome: 4500,
      monthlyExpenses: 3000,
      currentSavings: 25_000,
    },
  },
  customer_stay_the_course: {
    profile: baseProfile({
      financialLiteracy: 'advanced',
      riskTolerance: 'medium',
      goals: ['maintain diversified portfolio'],
      investmentHorizon: 'long',
      liquidityNeeds: 'low',
      ageCategory: '45_60',
    }),
    existingProducts: [
      {
        productId: 'savings-account',
        amountHeld: 15_000,
        currency: 'EUR',
        characteristics: 'Emergency buffer (~5 months)',
      },
      {
        productId: 'kbc-investment-plan',
        amountHeld: 20_000,
        currency: 'EUR',
      },
      {
        productId: 'pension-savings-fund',
        amountHeld: 35_000,
        currency: 'EUR',
      },
    ],
    finances: {
      monthlyIncome: 5500,
      monthlyExpenses: 3000,
      currentSavings: 15_000,
      investmentAllocation: [
        { label: 'investment plan', amount: 20_000, currency: 'EUR' },
        { label: 'pension fund', amount: 35_000, currency: 'EUR' },
      ],
    },
  },
  customer_insufficient_data: {
    profile: baseProfile({
      financialLiteracy: 'beginner',
      goals: [],
      notes: 'Customer just onboarded; transaction history not available yet',
    }),
    existingProducts: [],
    finances: {
      monthlyIncome: 0,
      monthlyExpenses: 0,
      currentSavings: 0,
    },
  },
  customer_weak_savings_rate: {
    profile: baseProfile({
      goals: ['save more each month'],
      investmentHorizon: 'medium',
    }),
    existingProducts: [
      {
        productId: 'savings-account',
        amountHeld: 4000,
        currency: 'EUR',
      },
    ],
    finances: {
      monthlyIncome: 4000,
      monthlyExpenses: 3200,
      currentSavings: 4000,
    },
  },
};

export const DEFAULT_MOCK_CUSTOMER_ID = 'customer_thin_buffer';

export function getMockCustomerInput(customerId: string): SavingsAdviceInput {
  const match = MOCK_CUSTOMERS[customerId];
  if (match) {
    return match;
  }

  const fallback = MOCK_CUSTOMERS[DEFAULT_MOCK_CUSTOMER_ID];
  if (!fallback) {
    throw new Error(
      `Missing default mock customer data for ${DEFAULT_MOCK_CUSTOMER_ID}`
    );
  }

  // Unknown ids fall back to a thin-data default so the pipeline still runs.
  return fallback;
}
