import type { Expense, Subscription } from '@repo/contracts';

import { FixtureBuilder, type Scenario } from './fixture-builder';

export const months = (
  start: number,
  end: number,
  year = 2026
): Array<string> =>
  Array.from(
    { length: end - start + 1 },
    (_, index) => `${year}-${String(start + index).padStart(2, '0')}`
  );

interface RecurringOptions {
  builder: FixtureBuilder;
  scenario: Scenario;
  key: string;
  account: string;
  party: string;
  amount: number;
  months: Array<string>;
  day: number;
  category?: Expense['category'];
  direction?: Expense['direction'];
  purpose?: Expense['purpose'];
  kind?: Subscription['kind'];
  status?: Subscription['status'];
  source: string;
  syntheticFields: Array<string>;
}

export const recurring = (options: RecurringOptions): string => {
  const { builder, scenario, account, key, party, amount, source, category } =
    options;
  const subscription = builder.subscription({
    key: `subscription:${key}`,
    scenario,
    source,
    syntheticFields: [...options.syntheticFields, 'kind'],
    data: {
      accountId: account,
      counterpartyId: builder.party(party),
      kind: options.kind ?? 'UNKNOWN',
      status: options.status ?? 'ACTIVE',
      amount,
      cadence: 'MONTHLY',
      category,
    },
  });
  for (const month of options.months) {
    builder.payment({
      key: `expense:${key}:${month}`,
      scenario,
      account,
      date: `${month}-${String(options.day).padStart(2, '0')}`,
      amount,
      party,
      description: party,
      category,
      direction: options.direction,
      purpose: options.purpose,
      type:
        options.kind === 'DIRECT_DEBIT'
          ? 'SEPA_DIRECT_DEBIT'
          : options.kind === 'STANDING_ORDER'
            ? 'STANDING_ORDER'
            : options.kind === 'CARD_PAYMENT'
              ? 'CARD_PAYMENT'
              : 'OTHER',
      subscription,
      source,
      syntheticFields: options.syntheticFields,
    });
  }
  return subscription;
};

export const salaries = (
  options: Omit<RecurringOptions, 'status' | 'kind'>
): void => {
  for (const month of options.months) {
    options.builder.payment({
      key: `expense:${options.key}:${month}`,
      scenario: options.scenario,
      account: options.account,
      date: `${month}-${String(options.day).padStart(2, '0')}`,
      amount: options.amount,
      party: options.party,
      description: options.party,
      direction: 'CREDIT',
      purpose: options.purpose ?? 'SALARY',
      type: 'SEPA_CREDIT_TRANSFER',
      source: options.source,
      syntheticFields: options.syntheticFields,
    });
  }
};

export const groceries = (
  options: Omit<RecurringOptions, 'day'> & {
    amounts: Array<number>;
    alternateParty?: string;
  }
): void => {
  for (const month of options.months) {
    for (const [index, amount] of options.amounts.entries()) {
      const party =
        index % 2 === 1
          ? (options.alternateParty ?? options.party)
          : options.party;
      options.builder.payment({
        key: `expense:${options.key}:${month}:${index}`,
        scenario: options.scenario,
        account: options.account,
        date: `${month}-${String(4 + index * 7).padStart(2, '0')}`,
        amount,
        party,
        description: party,
        category: 'GROCERIES',
        source: options.source,
        syntheticFields: options.syntheticFields,
      });
    }
  }
};
