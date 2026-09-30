import { FixtureBuilder } from './fixture-builder';
import { months, recurring, salaries } from './patterns';

export const addEva = (builder: FixtureBuilder): void => {
  const scenario = 'eva';
  const profile = builder.profile({
    key: 'profile:eva',
    scenario,
    source: 'Profile and product table',
    data: {
      firstName: 'Eva',
      lastName: 'Janssens',
      city: 'Antwerpen (Berchem)',
      maritalStatus: 'PARTNERED',
      housingStatus: 'OWNER_WITH_MORTGAGE',
      monthlyHousingCost: 720,
      employmentStatus: 'SELF_EMPLOYED',
      occupation: 'Freelance brand strategist',
      employmentStartDate: '2026-07-01',
      financialLiteracy: 'CAPABLE',
      liquidSavings: 11500,
      monthlySavingsTarget: null,
    },
  });
  const holder = builder.holder({
    key: 'holder:eva',
    scenario,
    source: 'Profile',
    data: { profileId: profile, displayName: 'Eva Janssens' },
  });
  const partner = builder.holder({
    key: 'holder:eva:partner',
    scenario,
    source: 'Joint mortgage with unnamed partner',
    data: { displayName: 'Eva’s partner' },
  });
  const current = builder.account({
    key: 'account:eva:current',
    scenario,
    source: 'Personal account; September balance €14,000',
    data: { holderIds: [holder], balance: 14000 },
  });
  const savings = builder.account({
    key: 'account:eva:savings',
    scenario,
    source: 'Savings €11,500',
    data: { holderIds: [holder], kind: 'SAVINGS', balance: 11500 },
  });
  builder.loan({
    key: 'loan:eva:mortgage',
    scenario,
    source:
      'Joint mortgage €185,000 outstanding; €720 is only Eva’s share, not full repayment',
    data: { borrowerIds: [holder, partner], outstandingBalance: 185000 },
  });
  builder.investment({
    key: 'investment:eva:pension',
    scenario,
    source: 'Pension savings €80/month',
    data: {
      holderIds: [holder],
      contributionAmount: 80,
      contributionCadence: 'MONTHLY',
    },
  });
  salaries({
    builder,
    scenario,
    key: 'eva:salary',
    account: current,
    party: 'Eva’s former employer',
    amount: 3050,
    months: months(1, 5),
    day: 25,
    source: 'Baseline salary about €3,050 on the 25th',
    syntheticFields: ['party.name', 'amount (fixed approximate salary)'],
  });
  recurring({
    builder,
    scenario,
    key: 'eva:mortgage-share',
    account: current,
    party: 'KBC mortgage (Eva’s share)',
    amount: 720,
    months: months(1, 9),
    day: 3,
    category: 'HOUSING',
    source: 'Monthly mortgage €720 her share',
    syntheticFields: ['bookingDate'],
  });
  recurring({
    builder,
    scenario,
    key: 'eva:pension',
    account: current,
    party: 'KBC pension savings',
    amount: 80,
    months: months(1, 9),
    day: 5,
    category: 'OTHER',
    source: 'Pension savings €80/month',
    syntheticFields: ['bookingDate'],
  });
  for (const month of months(1, 7)) {
    builder.transfer({
      key: `expense:eva:saving:${month}`,
      scenario,
      from: current,
      to: savings,
      date: `${month}-26`,
      amount: 300,
      description: 'Monthly savings',
      source: 'Monthly €300 savings stopped August',
      syntheticFields: ['bookingDate'],
    });
  }
  builder.subscription({
    key: 'subscription:eva:savings',
    scenario,
    source: 'Monthly savings stopped in August',
    data: {
      accountId: current,
      counterpartyId: builder.party('Eva’s savings account'),
      kind: 'STANDING_ORDER',
      status: 'CANCELLED',
      amount: 300,
      cadence: 'MONTHLY',
    },
  });
  builder.payment({
    key: 'expense:eva:final-salary',
    scenario,
    account: current,
    date: '2026-06-25',
    amount: 5900,
    party: 'Eva’s former employer',
    description: 'Final salary and holiday pay',
    direction: 'CREDIT',
    purpose: 'SALARY',
    type: 'SEPA_CREDIT_TRANSFER',
    source: 'June 25 final salary and holiday pay',
  });
  const rows = [
    ['2026-06-26', 105, 'Xerius', 'inschrijving KBO', 'FEES'],
    ['2026-06-28', 3200, 'Coolblue', 'MacBook Pro', 'SHOPPING'],
    ['2026-07-07', 850, 'Xerius', 'voorlopige bijdrage', 'TAXES'],
    ['2026-08-22', 450, 'Eva’s accountant', 'Accountant advance', 'FEES'],
  ] as const;
  for (const [date, amount, party, description, category] of rows) {
    builder.payment({
      key: `expense:eva:signal:${date}`,
      scenario,
      account: current,
      date,
      amount,
      party,
      description,
      category,
      source: `Key signals ${date}`,
      syntheticFields: ['type', 'category'],
    });
  }
  recurring({
    builder,
    scenario,
    key: 'eva:coworking',
    account: current,
    party: 'Coworking space Berchem',
    amount: 220,
    months: months(7, 9),
    day: 3,
    category: 'HOUSING',
    source: 'July 3 coworking €220/month',
    syntheticFields: [],
  });
  for (const [party, amount] of [
    ['Adobe Creative Cloud', 65],
    ['Canva Pro', 15],
    ['Figma', 30],
  ] as const) {
    recurring({
      builder,
      scenario,
      key: `eva:${party}`,
      account: current,
      party,
      amount,
      months: months(8, 9),
      day: 15,
      category: 'SUBSCRIPTIONS',
      source: 'August 15 three software subscriptions, combined €110/month',
      syntheticFields: ['amount (demo split of exact €110 combined price)'],
    });
  }
  const receipts = [
    ['2026-07-16', 3750, 'A'],
    ['2026-07-29', 3750, 'B'],
    ['2026-08-12', 900, 'A'],
    ['2026-08-26', 900, 'B'],
    ['2026-09-09', 2600, 'A'],
    ['2026-09-24', 2600, 'B'],
  ] as const;
  for (const [date, amount, client] of receipts) {
    builder.payment({
      key: `expense:eva:invoice:${date}`,
      scenario,
      account: current,
      date,
      amount,
      party: `Eva demo client ${client}`,
      description: `Invoice DEMO-${date}-${client}`,
      direction: 'CREDIT',
      purpose: 'BUSINESS_INCOME',
      type: 'SEPA_CREDIT_TRANSFER',
      source:
        'July €7,500; August €1,800; September €5,200 receipts from two regular clients',
      syntheticFields: [
        'bookingDate',
        'amount (split of exact monthly total)',
        'party.name',
        'description',
      ],
    });
  }
};
