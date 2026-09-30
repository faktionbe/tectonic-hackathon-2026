import {
  type Expense,
  type ExpenseListItem,
  expenseListItemSchema,
  expenseSchema,
  type Party,
  partySchema,
  type ProfileDetail,
  profileDetailSchema,
  type Subscription,
  type SubscriptionListItem,
  subscriptionListItemSchema,
  subscriptionSchema,
} from '@repo/contracts';

import { get, listAll } from './client';

export interface AnalysisPeriod {
  start: string;
  end: string;
}

export interface CustomerAccounts {
  profile: ProfileDetail;
  accountIds: Array<string>;
}

function toExpense(item: ExpenseListItem): Expense {
  return expenseSchema.parse(item);
}

function toSubscription(item: SubscriptionListItem): Subscription {
  return subscriptionSchema.parse(item);
}

export async function getProfileDetail(
  profileId: string
): Promise<ProfileDetail> {
  return get(`/profiles/${encodeURIComponent(profileId)}`, profileDetailSchema);
}

export async function loadCustomerAccounts(
  profileId: string
): Promise<CustomerAccounts> {
  const profile = await getProfileDetail(profileId);
  const financialHolder = profile.financialHolder;

  if (financialHolder === null) {
    throw new Error(
      `Profile ${profileId} has no financial holder; cannot load account-scoped data`
    );
  }

  const accountIds = financialHolder.accounts.map((account) => account.id);
  if (accountIds.length === 0) {
    throw new Error(
      `Profile ${profileId} has no linked accounts; cannot load account-scoped data`
    );
  }

  return { profile, accountIds };
}

export async function listExpenses(options: {
  accountIds: Array<string>;
  period?: AnalysisPeriod;
}): Promise<Array<Expense>> {
  if (options.accountIds.length === 0) {
    return [];
  }

  const items = await listAll('/expenses', expenseListItemSchema, {
    accountIds: options.accountIds.join(','),
    bookingDateFrom: options.period?.start,
    bookingDateTo: options.period?.end,
  });

  return items.map(toExpense);
}

export async function listSubscriptions(options: {
  accountIds: Array<string>;
}): Promise<Array<Subscription>> {
  if (options.accountIds.length === 0) {
    return [];
  }

  const items = await listAll('/subscriptions', subscriptionListItemSchema, {
    accountIds: options.accountIds.join(','),
  });

  return items.map(toSubscription);
}

export async function listParties(options: {
  ids: Array<string>;
}): Promise<Array<Party>> {
  if (options.ids.length === 0) {
    return [];
  }

  return listAll('/parties', partySchema, {
    ids: options.ids.join(','),
  });
}
