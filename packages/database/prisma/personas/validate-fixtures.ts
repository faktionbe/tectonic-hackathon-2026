import {
  accountSchema,
  creditCardSchema,
  financialHolderSchema,
  insuranceSchema,
  investmentSchema,
  loanSchema,
  partySchema,
  profileSchema,
  subscriptionSchema,
  validatedExpenseSchema,
} from '@repo/contracts';
import { z } from 'zod';

import type { PersonaFixtures } from './fixture-builder';

const requireReference = ({
  id,
  ids,
  label,
}: {
  id: string | null | undefined;
  ids: Set<string>;
  label: string;
}): void => {
  if (id != null && !ids.has(id)) {
    throw new Error(`Unknown ${label} reference ${id}`);
  }
};

export const validatePersonaFixtures = (fixtures: PersonaFixtures): void => {
  for (const value of fixtures.profiles) {
    profileSchema.parse(value);
  }
  for (const value of fixtures.holders) {
    financialHolderSchema.parse(value);
  }
  for (const value of fixtures.accounts) {
    accountSchema.parse(value);
  }
  for (const value of fixtures.loans) {
    loanSchema.parse(value);
  }
  for (const value of fixtures.cards) {
    creditCardSchema.parse(value);
  }
  for (const value of fixtures.investments) {
    investmentSchema.parse(value);
  }
  for (const value of fixtures.insurance) {
    insuranceSchema.parse(value);
  }
  for (const value of fixtures.parties) {
    partySchema.parse(value);
  }
  for (const value of fixtures.subscriptions) {
    subscriptionSchema.parse(value);
  }
  for (const value of fixtures.expenses) {
    validatedExpenseSchema.parse(value);
  }
  const collections = [
    fixtures.profiles,
    fixtures.holders,
    fixtures.accounts,
    fixtures.loans,
    fixtures.cards,
    fixtures.investments,
    fixtures.insurance,
    fixtures.parties,
    fixtures.subscriptions,
    fixtures.expenses,
  ];
  const allIds = new Set<string>();
  for (const collection of collections) {
    for (const record of collection) {
      z.uuidv7().parse(record.id);
      if (allIds.has(record.id)) {
        throw new Error(`Duplicate fixture ID ${record.id}`);
      }
      allIds.add(record.id);
    }
  }
  const profileIds = new Set(fixtures.profiles.map((record) => record.id));
  const holderIds = new Set(fixtures.holders.map((record) => record.id));
  const accountIds = new Set(fixtures.accounts.map((record) => record.id));
  const loanIds = new Set(fixtures.loans.map((record) => record.id));
  const partyIds = new Set(fixtures.parties.map((record) => record.id));
  const subscriptionIds = new Set(
    fixtures.subscriptions.map((record) => record.id)
  );
  const expenseIds = new Set<string>();
  for (const holder of fixtures.holders) {
    requireReference({
      id: holder.profileId,
      ids: profileIds,
      label: 'profile',
    });
  }
  for (const product of [
    ...fixtures.accounts,
    ...fixtures.cards,
    ...fixtures.investments,
  ]) {
    for (const id of product.holderIds) {
      requireReference({ id, ids: holderIds, label: 'holder' });
    }
  }
  for (const loan of fixtures.loans) {
    for (const id of loan.borrowerIds) {
      requireReference({ id, ids: holderIds, label: 'borrower' });
    }
    requireReference({
      id: loan.repaymentAccountId,
      ids: accountIds,
      label: 'repayment account',
    });
  }
  for (const card of fixtures.cards) {
    requireReference({
      id: card.billingAccountId,
      ids: accountIds,
      label: 'billing account',
    });
  }
  for (const insurance of fixtures.insurance) {
    for (const id of insurance.policyholderIds) {
      requireReference({ id, ids: holderIds, label: 'policyholder' });
    }
    for (const insured of insurance.insuredPersons) {
      requireReference({
        id: insured.holderId,
        ids: holderIds,
        label: 'insured person',
      });
    }
    requireReference({
      id: insurance.loanId,
      ids: loanIds,
      label: 'insured loan',
    });
  }
  for (const subscription of fixtures.subscriptions) {
    requireReference({
      id: subscription.accountId,
      ids: accountIds,
      label: 'subscription account',
    });
    requireReference({
      id: subscription.counterpartyId,
      ids: partyIds,
      label: 'subscription counterparty',
    });
  }
  for (const expense of fixtures.expenses) {
    requireReference({
      id: expense.accountId,
      ids: accountIds,
      label: 'expense account',
    });
    requireReference({
      id: expense.counterpartyAccountId,
      ids: accountIds,
      label: 'counterparty account',
    });
    requireReference({
      id: expense.counterpartyId,
      ids: partyIds,
      label: 'expense counterparty',
    });
    requireReference({
      id: expense.subscriptionId,
      ids: subscriptionIds,
      label: 'expense subscription',
    });
    requireReference({
      id: expense.originalExpenseId,
      ids: expenseIds,
      label: 'previously declared original expense',
    });
    expenseIds.add(expense.id);
    const cents = expense.amount * 100;
    if (Math.abs(cents - Math.round(cents)) > 0.00001) {
      throw new Error(`Fractional cents in ${expense.id}`);
    }
    if (
      expense.status !== 'BOOKED' &&
      expense.status !== 'REVERSED' &&
      expense.balanceAfter !== undefined
    ) {
      throw new Error(`Unbooked attempt has balance movement: ${expense.id}`);
    }
  }
};
