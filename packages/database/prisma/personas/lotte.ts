import { FixtureBuilder } from './fixture-builder';
import { groceries, months, recurring, salaries } from './patterns';

export const addLotte = (builder: FixtureBuilder): void => {
  const scenario = 'lotte';
  const profile = builder.profile({
    key: 'profile:lotte',
    scenario,
    source: 'Profile and What KBC already knows',
    data: {
      firstName: 'Lotte',
      lastName: 'Vermeulen',
      city: 'Kortrijk',
      maritalStatus: 'PARTNERED',
      housingStatus: 'RENTER',
      monthlyHousingCost: 575,
      employmentStatus: 'EMPLOYED',
      occupation: 'UX designer',
      monthlyNetIncome: 2750,
      financialLiteracy: 'EXPERT',
      liquidSavings: 8400,
      monthlySavingsTarget: 150,
      hasHomeInsurance: false,
    },
  });
  const holder = builder.holder({
    key: 'holder:lotte',
    scenario,
    source: 'Profile',
    data: { profileId: profile, displayName: 'Lotte Vermeulen' },
  });
  const current = builder.account({
    key: 'account:lotte:current',
    scenario,
    source: 'Current account',
    data: { holderIds: [holder] },
  });
  const savings = builder.account({
    key: 'account:lotte:savings',
    scenario,
    source: 'Savings account €8,400',
    data: { holderIds: [holder], kind: 'SAVINGS', balance: 8400 },
  });
  builder.card({
    key: 'card:lotte',
    scenario,
    source: 'Debit + credit card active',
    data: { holderIds: [holder], billingAccountId: current },
  });
  builder.investment({
    key: 'investment:lotte:pension',
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
    key: 'lotte:salary',
    account: current,
    party: 'Lotte’s employer',
    amount: 2750,
    months: months(7, 9),
    day: 1,
    source: 'Net monthly salary about €2,750 paid on the 1st',
    syntheticFields: ['party.name', 'amount (fixed approximate salary)'],
  });
  recurring({
    builder,
    scenario,
    key: 'lotte:pension',
    account: current,
    party: 'KBC pension savings',
    amount: 80,
    months: months(7, 9),
    day: 5,
    category: 'OTHER',
    source: 'Pension savings €80/month',
    syntheticFields: ['bookingDate'],
  });
  for (const [name, amount] of [
    ['Spotify', 10.99],
    ['Netflix', 13.99],
    ['Basic-Fit', 24.99],
  ] as const) {
    recurring({
      builder,
      scenario,
      key: `lotte:${name}`,
      account: current,
      party: name,
      amount,
      months: months(7, 9),
      day: 15,
      category: 'SUBSCRIPTIONS',
      source: 'Baseline named subscriptions; no source prices',
      syntheticFields: ['amount', 'bookingDate', 'cadence'],
    });
  }
  recurring({
    builder,
    scenario,
    key: 'lotte:nmbs',
    account: current,
    party: 'NMBS',
    amount: 95,
    months: months(7, 8),
    day: 1,
    category: 'TRANSPORT',
    status: 'CANCELLED',
    source: 'Baseline train subscription; not renewed September 30',
    syntheticFields: [
      'bookingDate',
      'status (non-renewal represented as cancelled)',
    ],
  });
  groceries({
    builder,
    scenario,
    key: 'lotte:groceries:kortrijk',
    account: current,
    party: 'Colruyt Kortrijk',
    amount: 0,
    amounts: [65, 72, 78, 69],
    months: months(7, 8),
    source: 'Baseline groceries €60–80/week',
    syntheticFields: ['amount', 'bookingDate'],
  });
  groceries({
    builder,
    scenario,
    key: 'lotte:groceries:gent',
    account: current,
    party: 'Colruyt Gent',
    amount: 0,
    amounts: [64, 73, 68, 76],
    months: months(9, 9),
    source: 'September 1–28 groceries shift to Ghent',
    syntheticFields: ['amount', 'bookingDate'],
  });
  builder.payment({
    key: 'expense:lotte:delhaize',
    scenario,
    account: current,
    date: '2026-09-28',
    amount: 22,
    party: 'Delhaize Sint-Amandsberg',
    description: 'Groceries near the new apartment',
    category: 'GROCERIES',
    source: 'September 1–28 new grocery counterparties',
    syntheticFields: ['amount', 'bookingDate'],
  });
  for (const month of months(7, 9)) {
    builder.transfer({
      key: `expense:lotte:saving:${month}`,
      scenario,
      from: current,
      to: savings,
      date: `${month}-02`,
      amount: 150,
      description: 'Monthly savings',
      source: 'Baseline €150 monthly transfer',
      syntheticFields: ['bookingDate'],
    });
    for (const day of ['18', '27']) {
      builder.payment({
        key: `expense:lotte:restaurant:${month}:${day}`,
        scenario,
        account: current,
        date: `${month}-${day}`,
        amount: 38,
        party: 'Restaurant in Ghent',
        description: 'Restaurant',
        category: 'DINING',
        source: 'Occasional restaurants and bars',
        syntheticFields: ['amount', 'bookingDate', 'party.name'],
      });
    }
  }
  builder.transfer({
    key: 'expense:lotte:withdraw-savings',
    scenario,
    from: savings,
    to: current,
    date: '2026-08-22',
    amount: 2000,
    description: 'Savings to current',
    source: 'August 22 savings transfer',
    syntheticFields: [],
  });
  const rows = [
    ['2026-07-03', 650, 'Kortrijk landlord', 'huur juli', 'HOUSING'],
    [
      '2026-08-18',
      1150,
      'Rental guarantee account at another bank',
      'huurwaarborg',
      'HOUSING',
    ],
    ['2026-08-25', 650, 'Kortrijk landlord', 'laatste huur', 'HOUSING'],
    ['2026-09-03', 575, 'Immo Vandenberghe BV', 'huur sept', 'HOUSING'],
    [
      '2026-09-05',
      420,
      'Verhuisbedrijf De Snelle Verhuis',
      'Moving company',
      'HOUSING',
    ],
    ['2026-09-06', 89, 'Hertz', 'Van rental', 'TRANSPORT'],
    ['2026-09-08', 1240, 'IKEA Gent', 'Furniture', 'SHOPPING'],
    ['2026-09-10', 186, 'Brico Gent-Dampoort', 'DIY', 'SHOPPING'],
    ['2026-09-15', 59, 'Telenet', 'Installation fee', 'UTILITIES'],
    ['2026-09-16', 18, 'Stad Gent', 'adreswijziging', 'FEES'],
    ['2026-09-20', 549, 'Coolblue', 'Washing machine', 'SHOPPING'],
  ] as const;
  for (const [date, amount, party, description, category] of rows) {
    builder.payment({
      key: `expense:lotte:signal:${date}`,
      type:
        description === 'huurwaarborg' ||
        (category === 'HOUSING' && party.includes('landlord')) ||
        description === 'huur sept'
          ? 'SEPA_CREDIT_TRANSFER'
          : 'CARD_PAYMENT',
      scenario,
      account: current,
      date,
      amount,
      party,
      description,
      category,
      source:
        date === '2026-07-03'
          ? 'Baseline rent paid on the 3rd'
          : `Key signals ${date}`,
      syntheticFields: ['type', 'category'],
    });
  }
  recurring({
    builder,
    scenario,
    key: 'lotte:engie',
    account: current,
    party: 'Engie',
    amount: 68,
    months: months(9, 9),
    day: 12,
    category: 'UTILITIES',
    kind: 'DIRECT_DEBIT',
    source: 'September 12 new energy contract',
    syntheticFields: ['cadence'],
  });
  builder.payment({
    key: 'expense:lotte:thomas',
    scenario,
    account: current,
    date: '2026-09-24',
    amount: 400,
    party: 'Thomas',
    description: 'gedeelde kosten',
    direction: 'CREDIT',
    purpose: 'HOUSEHOLD_SUPPORT',
    type: 'SEPA_CREDIT_TRANSFER',
    source: 'September 24 household contribution',
  });
};
