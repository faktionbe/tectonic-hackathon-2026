import type { Expense, Party, Subscription } from '@repo/contracts';

import type { ExpenseAnalysisInput } from '../../src/mastra/schemas/expense-analysis';

const ACCOUNT_ID = 'acc_test_1';

export function expense(
  partial: Partial<Expense> &
    Pick<Expense, 'id' | 'amount' | 'direction' | 'bookingDate'>
): Expense {
  return {
    accountId: ACCOUNT_ID,
    currency: 'EUR',
    type: 'CARD_PAYMENT',
    status: 'BOOKED',
    ...partial,
  };
}

export function party(
  partial: Partial<Party> & Pick<Party, 'id' | 'name' | 'kind'>
): Party {
  return {
    ...partial,
  };
}

export function subscription(
  partial: Partial<Subscription> &
    Pick<
      Subscription,
      'id' | 'counterpartyId' | 'kind' | 'status' | 'cadence' | 'amount'
    >
): Subscription {
  return {
    accountId: ACCOUNT_ID,
    currency: 'EUR',
    ...partial,
  };
}

export function analysisInput(
  partial: Omit<ExpenseAnalysisInput, 'expenses'> & {
    expenses: Array<Expense>;
  }
): ExpenseAnalysisInput {
  return partial;
}
