import { FixtureBuilder } from './fixture-builder';
import { months, salaries } from './patterns';

export const addKelly = (builder: FixtureBuilder): void => {
  const scenario = 'kelly';
  const profile = builder.profile({
    key: 'profile:kelly',
    scenario,
    source: 'Profile and product table',
    data: {
      firstName: 'Kelly',
      lastName: 'Vandamme',
      city: 'Knokke',
      maritalStatus: 'WIDOWED',
      employmentStatus: 'UNEMPLOYED',
      occupation: 'Former beautician',
      monthlyNetIncome: 0,
      otherMonthlyIncome: 0,
      financialLiteracy: 'LOW',
      liquidSavings: 2100,
    },
  });
  const holder = builder.holder({
    key: 'holder:kelly',
    scenario,
    source: 'Profile',
    data: { profileId: profile, displayName: 'Kelly Vandamme' },
  });
  const roger = builder.holder({
    key: 'holder:roger',
    scenario,
    source: 'Deceased husband Roger; no studied profile',
    data: { displayName: 'Roger' },
  });
  const current = builder.account({
    key: 'account:kelly:current',
    scenario,
    source: 'Own current account −€340 September 28',
    data: {
      holderIds: [holder],
      balance: -340,
      balanceAsOf: '2026-09-28T21:59:59.000Z',
    },
    syntheticFields: ['balanceAsOf (end of known local calendar day)'],
  });
  builder.account({
    key: 'account:kelly:savings',
    scenario,
    source: 'Own savings €2,100',
    data: { holderIds: [holder], kind: 'SAVINGS', balance: 2100 },
  });
  const joint = builder.account({
    key: 'account:kelly-roger:joint',
    scenario,
    source: 'Joint account blocked after August 8 death notification',
    data: { holderIds: [holder, roger], status: 'BLOCKED' },
  });
  const rogerCurrent = builder.account({
    key: 'account:roger:current',
    scenario,
    source: 'Roger’s blocked accounts; number and balances unspecified',
    data: { holderIds: [roger], status: 'BLOCKED', kind: null },
    explanation:
      'One representative known account, not an assertion of the number of accounts. The combined €900,000 stays only in context.',
  });
  builder.investment({
    key: 'investment:roger:blocked',
    scenario,
    source:
      'Roger’s investments blocked; combined accounts/investments approximately €900,000 with unknown split',
    data: { holderIds: [roger], kind: null, status: 'BLOCKED' },
    explanation: 'No share of the combined €900,000 is invented.',
  });
  builder.card({
    key: 'card:kelly',
    scenario,
    source: 'Card €5,000 limit, €4,600 used September 20',
    data: {
      holderIds: [holder],
      creditLimit: 5000,
      usedCredit: 4600,
      billingAccountId: current,
    },
  });
  builder.policy({
    key: 'insurance:roger:unspecified',
    scenario,
    source:
      'All insurance in Roger’s name; types and insured persons unspecified',
    data: { policyholderIds: [roger] },
  });
  salaries({
    builder,
    scenario,
    key: 'kelly:household-support',
    account: current,
    party: 'Roger',
    amount: 3500,
    months: months(7, 8),
    day: 1,
    purpose: 'HOUSEHOLD_SUPPORT',
    source: '€3,500 on the 1st before death; no September contribution',
    syntheticFields: [],
  });
  for (const month of months(7, 8)) {
    builder.payment({
      key: `expense:roger:household-support:${month}`,
      scenario,
      account: rogerCurrent,
      date: `${month}-01`,
      amount: 3500,
      party: 'Kelly Vandamme',
      description: 'Household contribution',
      type: 'SEPA_CREDIT_TRANSFER',
      purpose: 'HOUSEHOLD_SUPPORT',
      source: 'Roger’s €3,500 household contribution on the 1st',
      syntheticFields: ['accountId (representative known Roger account)'],
    });
  }
  builder.transfer({
    key: 'expense:kelly:survivor-withdrawal',
    scenario,
    from: joint,
    to: current,
    date: '2026-08-12',
    amount: 5000,
    description: 'Surviving partner urgent-cost release',
    source: 'August 12 €5,000 release from joint account',
  });
  builder.payment({
    key: 'expense:kelly:funeral',
    scenario,
    account: current,
    date: '2026-08-14',
    amount: 6800,
    party: 'Funeral director',
    description: 'Funeral',
    category: 'OTHER',
    source: 'August 14 funeral €6,800',
    syntheticFields: ['party.name', 'type'],
  });
  builder.payment({
    key: 'expense:kelly:notary',
    scenario,
    account: current,
    date: '2026-09-15',
    amount: 1200,
    party: 'Notary office',
    description: 'Estate notary',
    category: 'FEES',
    source: 'September 15 first notary payment €1,200',
    syntheticFields: ['party.name', 'type'],
  });
  const energy = builder.subscription({
    key: 'subscription:roger:energy',
    scenario,
    source: 'Energy direct debit on Roger’s account fails September 22',
    data: {
      accountId: rogerCurrent,
      counterpartyId: builder.party('Roger’s energy provider'),
      kind: 'DIRECT_DEBIT',
      amount: 180,
      cadence: 'MONTHLY',
      category: 'UTILITIES',
    },
    syntheticFields: ['amount', 'cadence', 'party.name'],
  });
  builder.payment({
    key: 'expense:roger:energy-failed',
    scenario,
    account: rogerCurrent,
    date: '2026-09-22',
    amount: 180,
    party: 'Roger’s energy provider',
    description: 'Energy payment blocked',
    category: 'UTILITIES',
    type: 'SEPA_DIRECT_DEBIT',
    status: 'BLOCKED',
    failureReason: 'Account blocked after death notification',
    subscription: energy,
    source: 'September 22 energy debit fails on blocked Roger account',
    syntheticFields: ['amount', 'party.name'],
  });
  for (const [date, amount, party] of [
    ['2026-07-06', 120, 'AZ Zeno'],
    ['2026-07-14', 45, 'Pharmacy Knokke'],
    ['2026-07-22', 170, 'Home nursing'],
  ] as const) {
    builder.payment({
      key: `expense:kelly:medical:${date}`,
      scenario,
      account: current,
      date,
      amount,
      party,
      description: 'Medical care',
      category: 'HEALTH',
      source:
        'July AZ Zeno, pharmacy and home nursing payments, no amounts/dates/accounts given',
      syntheticFields: [
        'amount',
        'bookingDate',
        'accountId',
        'party.name (where unnamed)',
      ],
    });
  }
  for (const month of months(7, 9)) {
    const total = month === '2026-09' ? 2900 : 2000;
    const dates = ['02', '04', '07', '09', '12', '16', '19', '21', '24', '27'];
    for (const [index, day] of dates.entries()) {
      const party =
        ['Louis Vuitton Knokke', 'Zalando', 'Rituals', 'Hairdresser Knokke'][
          index % 4
        ] ?? 'Zalando';
      const date = `${month}-${day}`;
      builder.payment({
        key: `expense:kelly:shopping:${month}:${index}`,
        scenario,
        account: current,
        date,
        timestamp:
          month === '2026-07' ? `${date}T12:15:00Z` : `${date}T23:15:00Z`,
        channel: month === '2026-07' ? 'POS' : 'ECOMMERCE',
        amount: total / dates.length,
        party,
        description: 'Clothing and beauty',
        category: 'SHOPPING',
        source:
          'Baseline €1,500–2,500/month; August continues old level; September exact combined €2,900; several online nighttime orders each week',
        syntheticFields: [
          'amount (equal split of monthly total)',
          'bookingDate',
          'transactionTimestamp',
          'party allocation',
          'channel',
        ],
        explanation:
          'All ten amounts sum to the stated September €2,900, not an additional €2,900 posting.',
      });
    }
    for (const day of ['06', '13', '20', '26']) {
      builder.payment({
        key: `expense:kelly:restaurant:${month}:${day}`,
        scenario,
        account: current,
        date: `${month}-${day}`,
        amount: 175,
        party: 'Restaurant Knokke',
        description: 'Restaurant and outings',
        category: 'DINING',
        source:
          'Baseline restaurants €600–900/month; fixed demo €700 continues',
        syntheticFields: ['amount', 'bookingDate', 'party.name'],
      });
    }
  }
};
