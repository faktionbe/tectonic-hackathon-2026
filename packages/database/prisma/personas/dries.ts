import { FixtureBuilder } from './fixture-builder';
import { groceries, months, recurring, salaries } from './patterns';

export const addDries = (builder: FixtureBuilder): void => {
  const scenario = 'dries';
  const profile = builder.profile({
    key: 'profile:dries',
    scenario,
    source: 'Profile and product table',
    data: {
      firstName: 'Dries',
      lastName: 'Claes',
      city: 'Genk',
      maritalStatus: 'SINGLE',
      housingStatus: 'RENTER',
      monthlyHousingCost: 780,
      employmentStatus: 'EMPLOYED',
      occupation: 'Logistics employee, shift work',
      monthlyNetIncome: 2350,
      financialLiteracy: 'LOW',
      liquidSavings: 40,
      hasHomeInsurance: true,
    },
  });
  const holder = builder.holder({
    key: 'holder:dries',
    scenario,
    source: 'Profile',
    data: { profileId: profile, displayName: 'Dries Claes' },
  });
  const current = builder.account({
    key: 'account:dries:current',
    scenario,
    source:
      'Current account often negative; €1,500 overdraft limit; current exact balance unspecified',
    data: { holderIds: [holder], overdraftLimit: 1500 },
  });
  const savings = builder.account({
    key: 'account:dries:savings',
    scenario,
    source: 'Savings €40, formerly €3,800',
    data: { holderIds: [holder], kind: 'SAVINGS', balance: 40 },
  });
  const revolut = builder.account({
    key: 'account:dries:revolut',
    scenario,
    source: 'Transfers to own Revolut account',
    data: {
      holderIds: [holder],
      providerName: 'Revolut',
      kind: null,
      status: null,
    },
  });
  builder.card({
    key: 'card:dries',
    scenario,
    source: 'Card €2,500 limit, €2,300 used',
    data: {
      holderIds: [holder],
      creditLimit: 2500,
      usedCredit: 2300,
      billingAccountId: current,
    },
  });
  builder.policy({
    key: 'insurance:dries:fire',
    scenario,
    source: 'Only mandatory tenant fire insurance',
    data: { policyholderIds: [holder], kind: 'FIRE' },
  });
  const period = ['2025-09', ...months(6, 9)];
  salaries({
    builder,
    scenario,
    key: 'dries:salary',
    account: current,
    party: 'Dries’s employer',
    amount: 2350,
    months: period,
    day: 1,
    source: 'Monthly salary approximately €2,350 on the 1st',
    syntheticFields: ['party.name', 'amount (fixed approximate salary)'],
  });
  const rent = recurring({
    builder,
    scenario,
    key: 'dries:rent',
    account: current,
    party: 'Dries’s landlord',
    amount: 780,
    months: ['2025-09', ...months(6, 8)],
    day: 3,
    category: 'HOUSING',
    kind: 'DIRECT_DEBIT',
    source: 'Monthly rent €780 on the 3rd; September 2026 rejected',
    syntheticFields: ['party.name'],
  });
  builder.payment({
    key: 'expense:dries:rejected-rent',
    scenario,
    account: current,
    date: '2026-09-03',
    amount: 780,
    party: 'Dries’s landlord',
    description: 'Rent September rejected',
    category: 'HOUSING',
    type: 'SEPA_DIRECT_DEBIT',
    status: 'REJECTED',
    failureReason: 'Insufficient funds',
    subscription: rent,
    source:
      'September 3 rent refused; modeled as one failed attempt, not a booked debit and refund',
  });
  builder.transfer({
    key: 'expense:dries:baseline-saving',
    scenario,
    from: current,
    to: savings,
    date: '2025-09-02',
    amount: 200,
    description: 'Monthly savings',
    source: 'Previous year monthly €200 savings',
    syntheticFields: ['bookingDate'],
  });
  builder.subscription({
    key: 'subscription:dries:saving',
    scenario,
    source: 'Historical savings pattern; now depleted',
    data: {
      accountId: current,
      counterpartyId: builder.party('Dries’s savings account'),
      kind: 'STANDING_ORDER',
      status: 'PAUSED',
      amount: 200,
      cadence: 'MONTHLY',
    },
    syntheticFields: ['status'],
  });
  builder.transfer({
    key: 'expense:dries:withdraw-savings',
    scenario,
    from: savings,
    to: current,
    date: '2026-08-04',
    amount: 1200,
    description: 'Entire savings balance transferred',
    source: 'August 4 €1,200 savings transferred',
  });
  for (const month of months(7, 9)) {
    builder.transfer({
      key: `expense:dries:revolut:${month}`,
      scenario,
      from: current,
      to: revolut,
      date: `${month}-12`,
      amount: 300,
      description: 'Own Revolut account',
      source: 'July–September transfers €200–400 to own Revolut',
      syntheticFields: ['amount', 'bookingDate'],
    });
  }
  for (const month of months(6, 9)) {
    const peakTimes = [
      ['01', '21:15'],
      ['01', '21:30'],
      ['01', '21:45'],
      ['01', '22:15'],
      ['01', '23:00'],
      ['02', '00:00'],
    ] as const;
    for (const [index, [day, time]] of peakTimes.entries()) {
      builder.payment({
        key: `expense:dries:gambling:${month}:peak:${index}`,
        scenario,
        account: current,
        date: `${month}-${day}`,
        timestamp: `${month}-${day}T${time}:00Z`,
        amount: 150,
        party: index % 2 === 0 ? 'Unibet' : 'Napoleon Sports & Casino',
        description: 'Online gambling deposit',
        category: 'ENTERTAINMENT',
        source:
          'June–September 15–30 deposits/month €20–150, 23:00–04:00 local; up to €900 within 48h after salary',
        syntheticFields: [
          'amount',
          'bookingDate',
          'transactionTimestamp',
          'party allocation',
        ],
      });
    }
    const amounts = [60, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 40, 60, 80];
    const days = [
      '05',
      '07',
      '09',
      '11',
      '13',
      '15',
      '17',
      '19',
      '21',
      '23',
      '25',
      '27',
      '28',
      '29',
    ];
    for (const [index, amount] of amounts.entries()) {
      builder.payment({
        key: `expense:dries:gambling:${month}:regular:${index}`,
        scenario,
        account: current,
        date: `${month}-${days[index]}`,
        timestamp: `${month}-${days[index]}T21:30:00Z`,
        amount,
        party: index % 2 === 0 ? 'Unibet' : 'Napoleon Sports & Casino',
        description: 'Online gambling deposit',
        category: 'ENTERTAINMENT',
        source:
          'June–September nighttime deposits; demo total €1,340 matches illustrative September insight',
        syntheticFields: [
          'bookingDate',
          'transactionTimestamp',
          'amount',
          'party allocation',
        ],
      });
    }
    if (month !== '2026-06') {
      builder.payment({
        key: `expense:dries:gambling-win:${month}`,
        scenario,
        account: current,
        date: `${month}-05`,
        timestamp: `${month}-05T21:00:00Z`,
        amount: 60,
        party: 'Unibet',
        description: 'Small gambling win',
        direction: 'CREDIT',
        category: 'ENTERTAINMENT',
        source:
          'July–September €60 wins reinvested within hours; matching €60 debit 30 minutes later',
        syntheticFields: [
          'bookingDate',
          'transactionTimestamp',
          'party allocation',
        ],
      });
    }
  }
  for (const day of ['12', '26']) {
    builder.payment({
      key: `expense:dries:baseline-bet:${day}`,
      scenario,
      account: current,
      date: `2025-09-${day}`,
      amount: 15,
      party: 'Unibet',
      description: 'Occasional sports bet',
      category: 'ENTERTAINMENT',
      source: 'Previous year occasional €10–20 sports bets',
      syntheticFields: ['bookingDate', 'amount'],
    });
  }
  groceries({
    builder,
    scenario,
    key: 'dries:groceries:baseline',
    account: current,
    party: 'Grocer Genk',
    amount: 0,
    amounts: [65, 70, 60, 65],
    months: ['2025-09', ...months(6, 8)],
    source: 'Normal baseline groceries',
    syntheticFields: ['amount', 'bookingDate', 'party.name'],
  });
  groceries({
    builder,
    scenario,
    key: 'dries:groceries:reduced',
    account: current,
    party: 'Grocer Genk',
    amount: 0,
    amounts: [25, 30, 35, 40],
    months: months(9, 9),
    source: 'September groceries €25–40/week',
    syntheticFields: ['amount', 'bookingDate', 'party.name'],
  });
  recurring({
    builder,
    scenario,
    key: 'dries:fitness',
    account: current,
    party: 'Fitness provider Genk',
    amount: 25,
    months: period,
    day: 15,
    category: 'SUBSCRIPTIONS',
    source: 'Baseline fitness',
    syntheticFields: ['amount', 'bookingDate', 'party.name', 'cadence'],
  });
  for (const day of ['13', '27']) {
    builder.payment({
      key: `expense:dries:baseline-weekend:${day}`,
      scenario,
      account: current,
      date: `2025-09-${day}`,
      amount: 45,
      party: 'Weekend venue Genk',
      description: 'Weekend outing',
      category: 'DINING',
      source: 'Baseline weekend outings',
      syntheticFields: ['amount', 'bookingDate', 'party.name'],
    });
  }
  for (const [month, amounts] of [
    ['2026-07', [15, 20]],
    ['2026-08', [25, 35, 45]],
    ['2026-09', [40, 50, 60, 60]],
  ] as const) {
    for (const [index, amount] of amounts.entries()) {
      const date = `${month}-${String(6 + index * 6).padStart(2, '0')}`;
      builder.payment({
        key: `expense:dries:night-impulse:${month}:${index}`,
        scenario,
        account: current,
        date,
        timestamp: `${date}T23:30:00Z`,
        amount,
        party: 'Nighttime impulse spending',
        description: 'Nighttime impulse spending',
        category: 'ENTERTAINMENT',
        source:
          'July–September private nighttime impulse payments €15–60 increasing; source requires anonymous aggregate categorization',
        syntheticFields: [
          'amount',
          'bookingDate',
          'transactionTimestamp',
          'party.name (privacy-preserving aggregate label)',
        ],
      });
    }
  }
  builder.subscription({
    key: 'subscription:dries:night-impulse',
    scenario,
    source:
      'Recurring private nighttime payments; no stable price or cadence supplied',
    data: {
      accountId: current,
      counterpartyId: builder.party('Nighttime impulse spending'),
      kind: 'CARD_PAYMENT',
      category: 'ENTERTAINMENT',
    },
  });
  builder.payment({
    key: 'expense:dries:casino-cash',
    scenario,
    account: current,
    date: '2026-09-10',
    amount: 300,
    party: 'Casino Middelkerke ATM',
    description: 'Cash withdrawal at casino',
    type: 'ATM_WITHDRAWAL',
    category: 'ENTERTAINMENT',
    source: 'September 10 €300 cash withdrawal in casino',
  });
};
