import { FixtureBuilder } from './fixture-builder';
import { groceries, months, recurring, salaries } from './patterns';

export const addJonasSarah = (builder: FixtureBuilder): void => {
  const scenario = 'jonas-sarah';
  const jonas = builder.profile({
    key: 'profile:jonas',
    scenario,
    source: 'Profile and product tables',
    data: {
      firstName: 'Jonas',
      lastName: 'Peeters',
      city: 'Mechelen',
      maritalStatus: 'MARRIED',
      housingStatus: 'OWNER_WITH_MORTGAGE',
      employmentStatus: 'EMPLOYED',
      occupation: 'Project engineer',
      monthlyNetIncome: 3100,
      financialLiteracy: 'LOW',
      hasHomeInsurance: true,
      hasHealthInsurance: false,
      hasLifeInsurance: true,
    },
  });
  const sarah = builder.profile({
    key: 'profile:sarah',
    scenario,
    source: 'Profile and product tables',
    data: {
      firstName: 'Sarah',
      lastName: 'Peeters',
      city: 'Mechelen',
      maritalStatus: 'MARRIED',
      housingStatus: 'OWNER_WITH_MORTGAGE',
      employmentStatus: 'EMPLOYED',
      occupation: 'Primary school teacher',
      monthlyNetIncome: 2600,
      financialLiteracy: 'CAPABLE',
      hasHomeInsurance: true,
      hasHealthInsurance: true,
      hasLifeInsurance: true,
    },
  });
  const jonasHolder = builder.holder({
    key: 'holder:jonas',
    scenario,
    source: 'Profile',
    data: { profileId: jonas, displayName: 'Jonas Peeters' },
  });
  const sarahHolder = builder.holder({
    key: 'holder:sarah',
    scenario,
    source: 'Profile',
    data: { profileId: sarah, displayName: 'Sarah Peeters' },
  });
  const holders = [jonasHolder, sarahHolder];
  const current = builder.account({
    key: 'account:peeters:joint',
    scenario,
    source: 'Joint current account, both salaries',
    data: { holderIds: holders },
  });
  const savings = builder.account({
    key: 'account:peeters:savings',
    scenario,
    source: 'Joint savings €14,200',
    data: { holderIds: holders, kind: 'SAVINGS', balance: 14200 },
  });
  builder.account({
    key: 'account:jonas:individual',
    scenario,
    source: 'Individual current accounts',
    data: { holderIds: [jonasHolder] },
  });
  const sarahCurrent = builder.account({
    key: 'account:sarah:individual',
    scenario,
    source: 'Individual current accounts',
    data: { holderIds: [sarahHolder] },
  });
  const mortgage = builder.loan({
    key: 'loan:peeters:mortgage',
    scenario,
    source: 'Mortgage and baseline payment',
    data: {
      borrowerIds: holders,
      outstandingBalance: 240000,
      remainingTermMonths: 276,
      repaymentAmount: 1050,
      repaymentCadence: 'MONTHLY',
      repaymentAccountId: current,
    },
  });
  builder.policy({
    key: 'insurance:peeters:mortgage',
    scenario,
    source: 'Outstanding balance insurance 50/50',
    data: {
      policyholderIds: holders,
      kind: 'OUTSTANDING_BALANCE',
      loanId: mortgage,
      insuredPersons: holders.map((holderId) => ({
        holderId,
        coveragePercentage: 50,
      })),
    },
  });
  builder.policy({
    key: 'insurance:peeters:fire',
    scenario,
    source: 'Fire insurance through KBC with mortgage',
    data: {
      policyholderIds: holders,
      providerName: 'KBC',
      kind: 'FIRE',
      loanId: mortgage,
    },
  });
  builder.policy({
    key: 'insurance:sarah:hospitalization',
    scenario,
    source: 'Sarah group insurance through school',
    data: {
      kind: 'HOSPITALIZATION',
      isEmployerProvided: true,
      insuredPersons: [{ holderId: sarahHolder, coveragePercentage: null }],
    },
  });
  for (const [name, holder] of [
    ['jonas', jonasHolder],
    ['sarah', sarahHolder],
  ] as const) {
    builder.investment({
      key: `investment:${name}:pension`,
      scenario,
      source: 'Both pension savings €80/month each',
      data: {
        holderIds: [holder],
        contributionAmount: 80,
        contributionCadence: 'MONTHLY',
      },
    });
    recurring({
      builder,
      scenario,
      key: `${name}:pension`,
      account: current,
      party: `KBC pension savings (${name})`,
      amount: 80,
      months: months(3, 9),
      day: 5,
      category: 'OTHER',
      source: 'Both pension savings €80/month each',
      syntheticFields: ['bookingDate', 'accountId (joint demo funding)'],
    });
  }
  salaries({
    builder,
    scenario,
    key: 'jonas:salary',
    account: current,
    party: 'Jonas’s employer',
    amount: 3100,
    months: months(3, 9),
    day: 1,
    source: 'Salary €3,100 on the 1st into joint account',
    syntheticFields: ['party.name', 'amount (fixed approximate salary)'],
  });
  salaries({
    builder,
    scenario,
    key: 'sarah:salary',
    account: current,
    party: 'Sarah’s school',
    amount: 2600,
    months: months(3, 9),
    day: 28,
    source: 'Salary €2,600 on the 28th into joint account',
    syntheticFields: ['party.name', 'amount (fixed approximate salary)'],
  });
  recurring({
    builder,
    scenario,
    key: 'peeters:mortgage',
    account: current,
    party: 'KBC mortgage',
    amount: 1050,
    months: months(3, 9),
    day: 3,
    category: 'HOUSING',
    source: 'Baseline €1,050/month mortgage',
    syntheticFields: ['bookingDate'],
  });
  for (const month of months(3, 7)) {
    builder.transfer({
      key: `expense:peeters:saving:${month}`,
      scenario,
      from: current,
      to: savings,
      date: `${month}-03`,
      amount: 400,
      description: 'Monthly savings',
      source: '€400 monthly savings; paused August 3',
      syntheticFields: ['bookingDate (baseline)'],
    });
  }
  builder.subscription({
    key: 'subscription:peeters:savings',
    scenario,
    source: 'Monthly savings paused August 3',
    data: {
      accountId: current,
      counterpartyId: builder.party('Joint savings account'),
      kind: 'STANDING_ORDER',
      status: 'PAUSED',
      amount: 400,
      cadence: 'MONTHLY',
    },
  });
  builder.transfer({
    key: 'expense:peeters:withdraw-savings',
    scenario,
    from: savings,
    to: current,
    date: '2026-09-14',
    amount: 2500,
    description: 'Savings for household purchases',
    source: 'September 14 €2,500 savings transfer',
  });
  groceries({
    builder,
    scenario,
    key: 'peeters:groceries',
    account: current,
    party: 'Delhaize Mechelen',
    alternateParty: 'Aldi Mechelen',
    amount: 0,
    amounts: [115, 125, 135, 120],
    months: months(3, 9),
    source: 'Baseline groceries €110–140/week at Delhaize and Aldi',
    syntheticFields: ['amount', 'bookingDate', 'party allocation'],
  });
  for (const [party, amount, category] of [
    ['Proximus', 65, 'UTILITIES'],
    ['Luminus', 160, 'UTILITIES'],
    ['Netflix', 13.99, 'ENTERTAINMENT'],
  ] as const) {
    recurring({
      builder,
      scenario,
      key: `peeters:${party}`,
      account: current,
      party,
      amount,
      category,
      months: months(3, 9),
      day: 10,
      source: 'Baseline named recurring charges',
      syntheticFields: ['amount', 'bookingDate', 'cadence'],
    });
  }
  recurring({
    builder,
    scenario,
    key: 'sarah:basic-fit',
    account: sarahCurrent,
    party: 'Basic-Fit',
    amount: 24.99,
    months: months(3, 6),
    day: 15,
    category: 'SUBSCRIPTIONS',
    status: 'CANCELLED',
    source: 'Basic-Fit cancelled July 2',
    syntheticFields: ['amount', 'bookingDate', 'accountId'],
  });
  for (const month of months(3, 9)) {
    for (const day of ['14', '23']) {
      builder.payment({
        key: `expense:peeters:restaurant:${month}:${day}`,
        scenario,
        account: current,
        date: `${month}-${day}`,
        amount: 75,
        party: 'Restaurant in Mechelen',
        description: 'Restaurant',
        category: 'DINING',
        source: 'Restaurants about twice a month',
        syntheticFields: ['amount', 'bookingDate', 'party.name'],
      });
    }
    builder.payment({
      key: `expense:peeters:fuel:${month}`,
      scenario,
      account: current,
      date: `${month}-16`,
      amount: 90,
      party: 'Fuel station Mechelen',
      description: 'Fuel',
      category: 'TRANSPORT',
      source: 'Baseline fuel',
      syntheticFields: ['amount', 'bookingDate', 'party.name'],
    });
  }
  for (const month of ['2026-04', '2026-07']) {
    builder.payment({
      key: `expense:peeters:weekend:${month}`,
      scenario,
      account: current,
      date: `${month}-18`,
      amount: 180,
      party: 'Weekend accommodation',
      description: 'Weekend trip',
      category: 'TRAVEL',
      source: 'Occasional weekend trips',
      syntheticFields: ['amount', 'bookingDate', 'party.name'],
    });
  }
  recurring({
    builder,
    scenario,
    key: 'peeters:pharmacy',
    account: current,
    party: 'Pharmacy Mechelen',
    amount: 18,
    months: months(6, 9),
    day: 4,
    category: 'HEALTH',
    source: 'June 4 pharmacy recurring monthly',
    syntheticFields: ['party.name'],
  });
  const rows = [
    ['2026-06-11', 65, 'Gynaecologist practice', 'Medical visit', 'HEALTH'],
    ['2026-06-20', 35, 'AZ Sint-Maarten', 'echo', 'HEALTH'],
    ['2026-07-09', 65, 'Gynaecologist practice', 'Medical visit', 'HEALTH'],
    ['2026-08-06', 65, 'Gynaecologist practice', 'Medical visit', 'HEALTH'],
    ['2026-09-03', 65, 'Gynaecologist practice', 'Medical visit', 'HEALTH'],
    ['2026-07-15', 42, 'Bol.com', 'Pregnancy order', 'SHOPPING'],
    ['2026-08-17', 890, 'Dreambaby Mechelen', 'Baby gear', 'SHOPPING'],
    ['2026-08-24', 170, 'Brico', 'Nursery paint', 'SHOPPING'],
    ['2026-08-24', 170, 'Praxis', 'Nursery flooring', 'SHOPPING'],
    ['2026-08-31', 620, 'IKEA Mechelen', 'Children’s furniture', 'SHOPPING'],
    ['2026-09-07', 50, "kinderopvang 't Rupske", 'inschrijving', 'EDUCATION'],
    ['2026-09-12', 349, 'Baby-Dump', 'Car seat', 'SHOPPING'],
    ['2026-09-19', 60, 'CM', 'Birth preparation course', 'HEALTH'],
    ['2026-09-26', 175, 'Photographer', 'zwangerschapsshoot', 'OTHER'],
  ] as const;
  for (const [date, amount, party, description, category] of rows) {
    builder.payment({
      key: `expense:peeters:signal:${date}:${party}`,
      type: party === 'Photographer' ? 'SEPA_CREDIT_TRANSFER' : 'CARD_PAYMENT',
      scenario,
      account: current,
      date,
      amount,
      party,
      description,
      category,
      source: `Key signals ${date}`,
      syntheticFields:
        date === '2026-08-24'
          ? [
              'amount (equal demo split of exact combined €340)',
              'type',
              'category',
            ]
          : ['type', 'category'],
    });
  }
};
