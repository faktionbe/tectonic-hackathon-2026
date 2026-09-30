import type { Expense, Party, Subscription } from '@repo/contracts';

import type { ExpenseAnalysisInput } from '../schemas/expense-analysis';

import {
  carPurchaseFixture,
  financialStressFixture,
  homePurchaseFixture,
  insufficientDataFixture,
  jobChangeFixture,
  lifestyleChangeFixture,
  spendingAnomalyFixture,
  travelFixture,
  unhealthyLifestyleFixture,
} from './transaction-fixtures';

export interface TransactionDataset {
  homeCountryCode?: string;
  expenses: Array<Expense>;
  parties: Array<Party>;
  subscriptions: Array<Subscription>;
}

export const TRANSACTION_CUSTOMER_IDS = {
  spendingAnomaly: 'customer_spending_anomaly',
  travel: 'customer_travel',
  lifestyleChange: 'customer_lifestyle_change',
  jobChange: 'customer_job_change',
  carPurchase: 'customer_car_purchase',
  homePurchase: 'customer_home_purchase',
  financialStress: 'customer_financial_stress',
  unhealthyLifestyle: 'customer_unhealthy_lifestyle',
  insufficientData: 'customer_expense_insufficient_data',
} as const;

function asDataset(input: ExpenseAnalysisInput): TransactionDataset {
  return {
    homeCountryCode: input.homeCountryCode,
    expenses: input.expenses,
    parties: input.parties ?? [],
    subscriptions: input.subscriptions ?? [],
  };
}

export const MOCK_TRANSACTIONS: Record<string, TransactionDataset> = {
  [TRANSACTION_CUSTOMER_IDS.spendingAnomaly]: asDataset(spendingAnomalyFixture),
  [TRANSACTION_CUSTOMER_IDS.travel]: asDataset(travelFixture),
  [TRANSACTION_CUSTOMER_IDS.lifestyleChange]: asDataset(lifestyleChangeFixture),
  [TRANSACTION_CUSTOMER_IDS.jobChange]: asDataset(jobChangeFixture),
  [TRANSACTION_CUSTOMER_IDS.carPurchase]: asDataset(carPurchaseFixture),
  [TRANSACTION_CUSTOMER_IDS.homePurchase]: asDataset(homePurchaseFixture),
  [TRANSACTION_CUSTOMER_IDS.financialStress]: asDataset(financialStressFixture),
  [TRANSACTION_CUSTOMER_IDS.unhealthyLifestyle]: asDataset(
    unhealthyLifestyleFixture
  ),
  [TRANSACTION_CUSTOMER_IDS.insufficientData]: asDataset(
    insufficientDataFixture
  ),
};

export function getMockTransactionDataset(
  customerId: string
): TransactionDataset {
  const match = MOCK_TRANSACTIONS[customerId];
  if (!match) {
    throw new Error(`No mock transaction data for customerId=${customerId}`);
  }

  return match;
}

export function filterExpensesByPeriod(
  expenses: Array<Expense>,
  period?: { start: string; end: string }
): Array<Expense> {
  if (!period) {
    return expenses;
  }

  return expenses.filter((expense) => {
    if (!expense.bookingDate) {
      return false;
    }

    return (
      expense.bookingDate >= period.start && expense.bookingDate <= period.end
    );
  });
}
