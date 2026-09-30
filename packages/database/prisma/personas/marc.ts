import { FixtureBuilder } from './fixture-builder';
import { groceries, months, recurring, salaries } from './patterns';

export const addMarc = (builder: FixtureBuilder): void => {
  const scenario = 'marc';
  const profile = builder.profile({
    key: 'profile:marc',
    scenario,
    source: 'Profile and product table',
    data: {
      firstName: 'Marc',
      lastName: 'Declercq',
      city: 'Brugge',
      maritalStatus: 'WIDOWED',
      housingStatus: 'OWNER_OUTRIGHT',
      employmentStatus: 'RETIRED',
      occupation: 'Retired accountant',
      monthlyNetIncome: 2050,
      financialLiteracy: 'DEVELOPING',
      liquidSavings: 68000,
      investmentBalance: 145000,
      mortgageBalance: 0,
      hasHomeInsurance: true,
      hasHealthInsurance: true,
      hasBrokerageAccount: true,
    },
  });
  const holder = builder.holder({
    key: 'holder:marc',
    scenario,
    source: 'Profile',
    data: { profileId: profile, displayName: 'Marc Declercq' },
  });
  const current = builder.account({
    key: 'account:marc:current',
    scenario,
    source: 'Active current account',
    data: { holderIds: [holder] },
  });
  builder.account({
    key: 'account:marc:savings',
    scenario,
    source: 'Savings €68,000',
    data: { holderIds: [holder], kind: 'SAVINGS', balance: 68000 },
  });
  builder.investment({
    key: 'investment:marc:funds',
    scenario,
    source: 'Fund portfolio approximately €145,000',
    data: { holderIds: [holder], kind: 'FUND_PORTFOLIO', currentValue: 145000 },
  });
  for (const kind of ['FIRE', 'FAMILY_LIABILITY', 'HOSPITALIZATION'] as const) {
    builder.policy({
      key: `insurance:marc:${kind}`,
      scenario,
      source: 'Existing fire, family liability and hospitalization insurance',
      data: {
        policyholderIds: [holder],
        providerName: kind === 'HOSPITALIZATION' ? null : 'KBC',
        kind,
        insuredPersons:
          kind === 'HOSPITALIZATION'
            ? [{ holderId: holder, coveragePercentage: null }]
            : [],
      },
    });
  }
  const period = [...months(1, 12, 2025), ...months(6, 9)];
  salaries({
    builder,
    scenario,
    key: 'marc:pension',
    account: current,
    party: 'Pension service',
    amount: 2050,
    months: period,
    day: 25,
    purpose: 'PENSION',
    source: 'Pension about €2,050 on the 25th',
    syntheticFields: ['party.name', 'amount (fixed approximate pension)'],
  });
  for (const [party, amount, category] of [
    ['Energy provider', 126, 'UTILITIES'],
    ['Water provider', 30, 'UTILITIES'],
    ['Proximus', 65, 'UTILITIES'],
    ['KBC insurance premiums', 85, 'INSURANCE'],
    ['Charity', 30, 'OTHER'],
  ] as const) {
    recurring({
      builder,
      scenario,
      key: `marc:${party}`,
      account: current,
      party,
      amount,
      months: period,
      day: 10,
      category,
      kind: 'DIRECT_DEBIT',
      source:
        party === 'Charity'
          ? 'Fixed monthly donation €30'
          : 'Baseline named direct debits with unspecified amounts',
      syntheticFields:
        party === 'Charity'
          ? ['bookingDate', 'party.name']
          : ['bookingDate', 'amount', 'party.name'],
    });
  }
  groceries({
    builder,
    scenario,
    key: 'marc:groceries',
    account: current,
    party: 'Delhaize Brugge',
    amount: 0,
    amounts: [44, 48, 42, 46],
    months: period,
    source: 'Baseline groceries at local baker and Delhaize',
    syntheticFields: ['amount', 'bookingDate', 'party allocation'],
  });
  for (const month of period) {
    builder.payment({
      key: `expense:marc:bakery:${month}`,
      scenario,
      account: current,
      date: `${month}-08`,
      amount: 12,
      party: 'Local bakery Brugge',
      description: 'Bakery',
      category: 'GROCERIES',
      source: 'Baseline local bakery',
      syntheticFields: ['amount', 'bookingDate', 'party.name'],
    });
  }
  for (const month of months(1, 12, 2025)) {
    builder.payment({
      key: `expense:marc:cash-baseline:${month}`,
      scenario,
      account: current,
      date: `${month}-02`,
      amount: 200,
      party: 'ATM Brugge',
      description: 'Cash withdrawal',
      type: 'ATM_WITHDRAWAL',
      category: 'OTHER',
      source: 'Previous year cash once per month €200',
      syntheticFields: ['bookingDate', 'party.name'],
    });
  }
  for (const month of months(6, 9)) {
    for (const [index, day] of [
      '02',
      '06',
      '10',
      '14',
      '18',
      '22',
      '26',
    ].entries()) {
      builder.payment({
        key: `expense:marc:cash:${month}:${day}`,
        scenario,
        account: current,
        date: `${month}-${day}`,
        amount: index % 2 === 0 ? 40 : 60,
        party: 'ATM Brugge',
        description: 'Cash withdrawal',
        type: 'ATM_WITHDRAWAL',
        category: 'OTHER',
        source: 'June–September 6–8 cash withdrawals/month, €40–60 each',
        syntheticFields: ['bookingDate', 'amount', 'party.name'],
      });
    }
  }
  for (const index of [1, 2]) {
    builder.payment({
      key: `expense:marc:fluvius:${index}`,
      scenario,
      account: current,
      date: '2026-07-14',
      amount: 126,
      party: 'Fluvius',
      description: 'Same Fluvius invoice paid twice',
      type: 'SEPA_CREDIT_TRANSFER',
      category: 'UTILITIES',
      source: 'July 14 duplicate Fluvius payment: two separate €126 postings',
    });
  }
  const plumbing = builder.payment({
    key: 'expense:marc:plumber',
    scenario,
    account: current,
    date: '2026-08-02',
    amount: 175,
    party: 'Plumber',
    description: 'Manual transfer with typo',
    type: 'SEPA_CREDIT_TRANSFER',
    category: 'HOUSING',
    source: 'August 2 plumbing transfer returned; amount unspecified',
    syntheticFields: ['amount'],
  });
  builder.payment({
    key: 'expense:marc:plumber-return',
    scenario,
    account: current,
    date: '2026-08-03',
    amount: 175,
    party: 'Plumber',
    description: 'Return of incorrect transfer',
    type: 'REVERSAL',
    status: 'REVERSED',
    direction: 'CREDIT',
    category: 'HOUSING',
    original: plumbing,
    source: 'August 2 plumbing transfer returned; return date unspecified',
    syntheticFields: ['amount', 'bookingDate'],
  });
  recurring({
    builder,
    scenario,
    key: 'marc:home-care',
    account: current,
    party: 'Home-care service',
    amount: 85,
    months: months(8, 9),
    day: 5,
    category: 'HEALTH',
    source: 'Home-care recurring €85/month begins August',
    syntheticFields: ['bookingDate', 'party.name'],
  });
  for (const [month, amount] of [
    ['2026-06', 20],
    ['2026-07', 20],
    ['2026-08', 45],
    ['2026-09', 65],
  ] as const) {
    builder.payment({
      key: `expense:marc:pharmacy:${month}`,
      scenario,
      account: current,
      date: `${month}-12`,
      amount,
      party: 'Pharmacy Brugge',
      description: 'Pharmacy',
      category: 'HEALTH',
      source: 'Pharmacy spending increases August–September',
      syntheticFields: ['amount', 'bookingDate', 'party.name'],
    });
  }
  for (const [label, day] of [
    ['one', 11],
    ['two', 14],
  ] as const) {
    recurring({
      builder,
      scenario,
      key: `marc:supplements:${label}`,
      account: current,
      party: `Supplement provider ${label}`,
      amount: 49,
      months: months(9, 9),
      day,
      category: 'HEALTH',
      source:
        'September 11 supplement subscription €49/month; a second a few days later',
      syntheticFields:
        label === 'two' ? ['bookingDate', 'party.name'] : ['party.name'],
    });
  }
  for (const [key, time, amount] of [
    ['first', '19:14:00', 2400],
    ['second', '19:20:00', 2350],
  ] as const) {
    builder.payment({
      key: `expense:marc:fraud-attempt:${key}`,
      scenario,
      account: current,
      date: '2026-09-23',
      timestamp: `2026-09-23T${time}Z`,
      amount,
      party: 'New beneficiary claiming to be Jens',
      description: 'dringend voor Jens',
      type: 'SEPA_CREDIT_TRANSFER',
      status: 'ATTEMPTED',
      source:
        'September 23 21:14 and 21:20 Europe/Brussels attempts, first €2,400, second slightly adjusted',
      syntheticFields: key === 'second' ? ['amount'] : [],
    });
  }
};
