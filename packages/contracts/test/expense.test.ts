import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type Expense,
  expenseSchema,
  type ExpenseStatus,
  type Subscription,
  subscriptionSchema,
  validatedExpenseSchema,
} from '../src';

const bookedExpense: Expense = {
  id: 'expense-rent',
  accountId: 'acc_demo_001',
  amount: 780,
  currency: 'EUR',
  direction: 'DEBIT',
  bookingDate: '2026-09-03',
  type: 'SEPA_DIRECT_DEBIT',
  status: 'BOOKED',
};

const unbookedStatuses: Array<ExpenseStatus> = [
  'PENDING',
  'ATTEMPTED',
  'BLOCKED',
  'REJECTED',
];

await describe('expense contracts', async () => {
  await it('preserves existing booked payloads and legacy account IDs', () => {
    assert.deepStrictEqual(
      validatedExpenseSchema.parse(bookedExpense),
      bookedExpense
    );
  });

  await it('keeps the existing create and partial DTO composition usable', () => {
    const createSchema = expenseSchema.omit({ id: true });
    const updateSchema = createSchema.partial();
    assert.strictEqual(
      createSchema.parse(bookedExpense).accountId,
      'acc_demo_001'
    );
    assert.deepStrictEqual(updateSchema.parse({ status: 'REJECTED' }), {
      status: 'REJECTED',
    });
    assert.strictEqual(
      expenseSchema.parse({ ...bookedExpense, status: 'PENDING' }).status,
      'PENDING'
    );
  });

  for (const status of ['BOOKED', 'REVERSED']) {
    await it(`requires a booking date for ${status} even when an attempt time exists`, () => {
      assert.strictEqual(
        validatedExpenseSchema.safeParse({
          ...bookedExpense,
          status,
          bookingDate: undefined,
          transactionTimestamp: '2026-09-03T08:00:00Z',
        }).success,
        false
      );
      assert.strictEqual(
        validatedExpenseSchema.safeParse({ ...bookedExpense, status }).success,
        true
      );
    });
  }

  for (const status of unbookedStatuses) {
    await it(`accepts ${status} with a calendar date and no fabricated booking`, () => {
      const expense = validatedExpenseSchema.parse({
        ...bookedExpense,
        status,
        bookingDate: undefined,
        transactionDate: '2026-09-03',
      });
      assert.strictEqual(expense.bookingDate, undefined);
      assert.strictEqual(expense.transactionTimestamp, undefined);
      assert.strictEqual(expense.transactionDate, '2026-09-03');
    });

    await it(`requires an occurrence date or timestamp for ${status}`, () => {
      assert.strictEqual(
        validatedExpenseSchema.safeParse({
          ...bookedExpense,
          status,
          bookingDate: undefined,
        }).success,
        false
      );
      assert.strictEqual(
        validatedExpenseSchema.safeParse({ ...bookedExpense, status }).success,
        false
      );
    });
  }

  await it('retains source failure details without inventing a balance movement', () => {
    const rejected = validatedExpenseSchema.parse({
      ...bookedExpense,
      bookingDate: undefined,
      transactionDate: '2026-09-03',
      status: 'REJECTED',
      failureReason: 'Insufficient funds',
    });
    assert.strictEqual(rejected.failureReason, 'Insufficient funds');
    assert.strictEqual(rejected.balanceAfter, undefined);
  });

  await it('distinguishes income from transfers between owned accounts and linked returns', () => {
    const salary = validatedExpenseSchema.parse({
      ...bookedExpense,
      direction: 'CREDIT',
      purpose: 'SALARY',
      type: 'SEPA_CREDIT_TRANSFER',
    });
    const transfer = validatedExpenseSchema.parse({
      ...salary,
      purpose: 'OWN_ACCOUNT_TRANSFER',
      counterpartyAccountId: 'account-savings',
    });
    const returned = validatedExpenseSchema.parse({
      ...bookedExpense,
      direction: 'CREDIT',
      type: 'REVERSAL',
      status: 'REVERSED',
      originalExpenseId: bookedExpense.id,
    });
    assert.strictEqual(salary.purpose, 'SALARY');
    assert.strictEqual(transfer.counterpartyAccountId, 'account-savings');
    assert.strictEqual(returned.originalExpenseId, bookedExpense.id);
  });

  await it('preserves zero and negative balances while rejecting nonpositive transaction amounts', () => {
    for (const balanceAfter of [0, -340]) {
      assert.strictEqual(
        expenseSchema.parse({ ...bookedExpense, balanceAfter }).balanceAfter,
        balanceAfter
      );
    }
    for (const amount of [0, -1]) {
      assert.strictEqual(
        expenseSchema.safeParse({ ...bookedExpense, amount }).success,
        false
      );
    }
  });

  await it('rejects unknown classification values and invalid dates', () => {
    for (const fields of [
      { status: 'FAILED' },
      { purpose: 'UNRECOGNIZED' },
      { direction: 'INCOMING' },
      { transactionDate: '2026-02-30' },
      { transactionTimestamp: '2026-09-23' },
    ]) {
      assert.strictEqual(
        expenseSchema.safeParse({ ...bookedExpense, ...fields }).success,
        false
      );
    }
  });
});

await describe('subscription contracts', async () => {
  const subscription: Subscription = {
    id: 'subscription-demo',
    accountId: 'acc_demo_001',
    counterpartyId: 'merchant-demo',
    kind: 'DIRECT_DEBIT',
    status: 'ACTIVE',
    amount: 13.99,
    currency: 'EUR',
    cadence: 'MONTHLY',
    mandateId: 'demo-mandate',
    cancellable: false,
    occurrenceCount: 0,
  };

  await it('preserves existing recurring-payment payloads including false and zero', () => {
    assert.deepStrictEqual(
      subscriptionSchema.parse(subscription),
      subscription
    );
  });

  await it('allows a known service with an unknown rail, price, and schedule', () => {
    const parsed = subscriptionSchema.parse({
      id: 'subscription-spotify',
      accountId: 'account-lotte',
      counterpartyId: 'merchant-spotify',
      kind: 'UNKNOWN',
      status: 'ACTIVE',
      currency: 'EUR',
    });
    assert.strictEqual(parsed.amount, undefined);
    assert.strictEqual(parsed.cadence, undefined);
    assert.strictEqual(parsed.mandateId, undefined);
  });

  await it('supports recurring card payments without requiring a SEPA mandate', () => {
    const parsed = subscriptionSchema.parse({
      ...subscription,
      kind: 'CARD_PAYMENT',
      mandateId: undefined,
    });
    assert.strictEqual(parsed.kind, 'CARD_PAYMENT');
    assert.strictEqual(parsed.mandateId, undefined);
  });

  await it('rejects an invalid supplied amount, cadence, or kind', () => {
    for (const fields of [
      { amount: 0 },
      { amount: -1 },
      { amount: null },
      { cadence: 'DAILY' },
      { kind: 'CASH' },
    ]) {
      assert.strictEqual(
        subscriptionSchema.safeParse({ ...subscription, ...fields }).success,
        false
      );
    }
  });
});
