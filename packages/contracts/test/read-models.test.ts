import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  expenseDetailSchema,
  expenseListItemSchema,
  profileDetailSchema,
  profileListItemSchema,
  subscriptionDetailSchema,
  subscriptionListItemSchema,
} from '../src';

const timestamps = {
  createdAt: '2026-09-30T18:00:00.000Z',
  updatedAt: '2026-09-30T18:00:00.000Z',
};

const profile = {
  id: 'profile-demo',
  firstName: 'Demo',
  lastName: 'Customer',
  dateOfBirth: null,
  email: null,
  phone: null,
  customerReference: null,
  maritalStatus: null,
  dependentCount: 0,
  street: null,
  city: null,
  postalCode: null,
  country: null,
  housingStatus: null,
  monthlyHousingCost: null,
  employmentStatus: null,
  occupation: null,
  employer: null,
  employmentStartDate: null,
  currency: 'EUR',
  monthlyNetIncome: null,
  otherMonthlyIncome: null,
  financialLiteracy: null,
  riskTolerance: null,
  personalizationConsent: null,
  investmentHorizonMonths: null,
  liquidityReserveTarget: null,
  goals: [],
  serviceInterests: [],
  monthlyEssentialExpenses: null,
  monthlyDiscretionaryExpenses: null,
  monthlySavingsTarget: null,
  liquidSavings: null,
  investmentBalance: null,
  pensionBalance: null,
  realEstateValue: null,
  mortgageBalance: null,
  consumerDebtBalance: null,
  otherDebtBalance: null,
  hasLifeInsurance: null,
  hasHomeInsurance: null,
  hasHealthInsurance: null,
  hasBrokerageAccount: null,
  notes: null,
  ...timestamps,
};

const account = {
  id: 'account-demo',
  holderIds: ['holder-demo'],
  providerName: 'KBC',
  iban: 'BE68539007547034',
  kind: 'CURRENT',
  purpose: 'PERSONAL',
  status: 'ACTIVE',
  currency: 'EUR',
  balance: 1200.5,
  balanceAsOf: '2026-09-30T18:00:00.000Z',
  overdraftLimit: null,
  ...timestamps,
};

const expense = {
  id: 'expense-rent',
  accountId: account.id,
  amount: 780,
  currency: 'EUR',
  direction: 'DEBIT',
  bookingDate: '2026-09-03',
  type: 'SEPA_DIRECT_DEBIT',
  status: 'BOOKED',
};

const subscription = {
  id: 'subscription-netflix',
  accountId: account.id,
  counterpartyId: 'party-netflix',
  kind: 'DIRECT_DEBIT',
  status: 'ACTIVE',
  currency: 'EUR',
  amount: 13.99,
  cadence: 'MONTHLY',
};

await describe('read models', async () => {
  await it('lists an expense with its account and without a counterparty', () => {
    const item = expenseListItemSchema.parse({
      ...expense,
      account: {
        id: account.id,
        providerName: account.providerName,
        iban: account.iban,
        kind: account.kind,
        currency: account.currency,
        status: account.status,
      },
      counterparty: null,
      subscription: null,
    });
    assert.strictEqual(item.account.iban, account.iban);
    assert.strictEqual(item.counterparty, null);
  });

  await it('details an expense with the records its foreign keys point at', () => {
    const detail = expenseDetailSchema.parse({
      ...expense,
      account,
      counterparty: null,
      counterpartyAccount: null,
      subscription,
      originalExpense: null,
      relatedExpenses: [],
    });
    assert.strictEqual(detail.subscription?.id, subscription.id);
    assert.deepStrictEqual(detail.relatedExpenses, []);
  });

  await it('keeps an unknown subscription amount off the list item', () => {
    const item = subscriptionListItemSchema.parse({
      ...subscription,
      amount: undefined,
      account: {
        id: account.id,
        providerName: null,
        iban: null,
        kind: null,
        currency: null,
        status: null,
      },
      counterparty: {
        id: 'party-netflix',
        kind: 'MERCHANT',
        name: 'Netflix',
      },
    });
    assert.strictEqual(item.amount, undefined);
    assert.strictEqual(item.counterparty.name, 'Netflix');
  });

  await it('details a subscription with its charges', () => {
    const detail = subscriptionDetailSchema.parse({
      ...subscription,
      account,
      counterparty: {
        id: 'party-netflix',
        kind: 'MERCHANT',
        name: 'Netflix',
      },
      expenses: [expense],
    });
    assert.strictEqual(detail.expenses.length, 1);
    assert.strictEqual(detail.account.balance, 1200.5);
  });

  await it('lists a profile that has no financial holder', () => {
    const item = profileListItemSchema.parse({
      ...profile,
      financialHolder: null,
    });
    assert.strictEqual(item.financialHolder, null);
  });

  await it('details a profile with empty product collections', () => {
    const detail = profileDetailSchema.parse({
      ...profile,
      financialHolder: {
        id: 'holder-demo',
        profileId: profile.id,
        displayName: 'Demo Customer',
        ...timestamps,
        accounts: [account],
        loans: [],
        creditCards: [],
        investments: [],
        insurancePolicies: [],
        insuranceCoverages: [],
      },
    });
    const holder = detail.financialHolder;
    assert.ok(holder);
    const linkedAccount = holder.accounts[0];
    assert.ok(linkedAccount);
    assert.strictEqual(linkedAccount.id, account.id);
    assert.deepStrictEqual(holder.loans, []);
  });
});
