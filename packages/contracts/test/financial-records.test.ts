import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type Account,
  accountSchema,
  type CreditCard,
  creditCardSchema,
  financialHolderSchema,
  type Insurance,
  insuranceSchema,
  insuredPersonSchema,
  type Investment,
  investmentSchema,
  type Loan,
  loanSchema,
  type Profile,
  profileSchema,
  subscriptionSchema,
  validatedExpenseSchema,
} from '../src';

const timestamps = {
  createdAt: '2026-09-30T18:00:00Z',
  updatedAt: '2026-09-30T18:00:00Z',
};

const account: Account = {
  id: 'account-demo',
  holderIds: [],
  providerName: null,
  iban: null,
  kind: null,
  purpose: null,
  status: null,
  currency: null,
  balance: null,
  balanceAsOf: null,
  overdraftLimit: null,
  ...timestamps,
};

const loan: Loan = {
  id: 'loan-demo',
  borrowerIds: [],
  providerName: null,
  productName: null,
  kind: null,
  currency: null,
  outstandingBalance: null,
  repaymentAmount: null,
  repaymentCadence: null,
  remainingTermMonths: null,
  repaymentAccountId: null,
  ...timestamps,
};

const creditCard: CreditCard = {
  id: 'card-demo',
  holderIds: [],
  providerName: null,
  productName: null,
  currency: null,
  creditLimit: null,
  usedCredit: null,
  billingAccountId: null,
  ...timestamps,
};

const investment: Investment = {
  id: 'investment-demo',
  holderIds: [],
  providerName: null,
  productName: null,
  kind: null,
  currency: null,
  currentValue: null,
  valuationDate: null,
  contributionAmount: null,
  contributionCadence: null,
  status: null,
  ...timestamps,
};

const insurance: Insurance = {
  id: 'insurance-demo',
  policyholderIds: [],
  providerName: null,
  productName: null,
  kind: null,
  isEmployerProvided: null,
  loanId: null,
  insuredPersons: [],
  ...timestamps,
};

const legacyProfile: Omit<
  Profile,
  | 'personalizationConsent'
  | 'investmentHorizonMonths'
  | 'liquidityReserveTarget'
> = {
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

await describe('persona financial records', async () => {
  await it('represents Lotte without inventing a subscription price or account details', () => {
    const holder = financialHolderSchema.parse({
      id: 'holder-lotte',
      profileId: 'profile-lotte',
      displayName: 'Lotte Vermeulen',
      ...timestamps,
    });
    const savings = accountSchema.parse({
      ...account,
      id: 'account-lotte-savings',
      holderIds: [holder.id],
      kind: 'SAVINGS',
      balance: 8400,
      currency: 'EUR',
    });
    const subscription = subscriptionSchema.parse({
      id: 'subscription-lotte-spotify',
      accountId: 'account-lotte-current',
      counterpartyId: 'merchant-spotify',
      kind: 'UNKNOWN',
      status: 'ACTIVE',
      currency: 'EUR',
    });
    assert.deepStrictEqual(savings.holderIds, [holder.id]);
    assert.strictEqual(savings.iban, null);
    assert.strictEqual(subscription.amount, undefined);
  });

  await it('represents Jonas and Sarah with shared records and separate coverage and pensions', () => {
    const jointAccount = accountSchema.parse({
      ...account,
      id: 'account-peeters',
      holderIds: ['holder-jonas', 'holder-sarah'],
      kind: 'CURRENT',
      currency: 'EUR',
    });
    const mortgage = loanSchema.parse({
      ...loan,
      id: 'loan-peeters',
      borrowerIds: jointAccount.holderIds,
      kind: 'MORTGAGE',
      currency: 'EUR',
      outstandingBalance: 240000,
      repaymentAmount: 1050,
      repaymentCadence: 'MONTHLY',
      remainingTermMonths: 276,
      repaymentAccountId: jointAccount.id,
    });
    const mortgageCover = insuranceSchema.parse({
      ...insurance,
      kind: 'OUTSTANDING_BALANCE',
      loanId: mortgage.id,
      policyholderIds: jointAccount.holderIds,
      insuredPersons: [
        { holderId: 'holder-jonas', coveragePercentage: 50 },
        { holderId: 'holder-sarah', coveragePercentage: 50 },
      ],
    });
    const sarahCover = insuranceSchema.parse({
      ...insurance,
      kind: 'HOSPITALIZATION',
      isEmployerProvided: true,
      insuredPersons: [{ holderId: 'holder-sarah', coveragePercentage: null }],
    });
    const pensions = jointAccount.holderIds.map((holderId) =>
      investmentSchema.parse({
        ...investment,
        id: `pension-${holderId}`,
        holderIds: [holderId],
        kind: 'PENSION_SAVINGS',
        currency: 'EUR',
        contributionAmount: 80,
        contributionCadence: 'MONTHLY',
      })
    );
    assert.strictEqual(mortgage.repaymentAccountId, jointAccount.id);
    assert.strictEqual(mortgage.outstandingBalance, 240000);
    assert.strictEqual(mortgageCover.insuredPersons.length, 2);
    assert.strictEqual(sarahCover.insuredPersons.length, 1);
    assert.strictEqual(pensions.length, 2);
    assert.deepStrictEqual(
      pensions.map((pension) => pension.currentValue),
      [null, null]
    );
    assert.strictEqual(new Set(pensions.map((pension) => pension.id)).size, 2);
  });

  await it('keeps Eva’s private account distinct from the purpose of business receipts', () => {
    const privateAccount = accountSchema.parse({
      ...account,
      id: 'account-eva',
      holderIds: ['holder-eva'],
      kind: 'CURRENT',
      purpose: 'PERSONAL',
      currency: 'EUR',
      balance: 14000,
    });
    const receipt = validatedExpenseSchema.parse({
      id: 'expense-business-example',
      accountId: privateAccount.id,
      amount: 100,
      currency: 'EUR',
      direction: 'CREDIT',
      bookingDate: '2026-09-30',
      type: 'SEPA_CREDIT_TRANSFER',
      status: 'BOOKED',
      purpose: 'BUSINESS_INCOME',
    });
    assert.strictEqual(privateAccount.purpose, 'PERSONAL');
    assert.strictEqual(receipt.purpose, 'BUSINESS_INCOME');
    assert.strictEqual(privateAccount.balance, 14000);
  });

  await it('represents Marc’s investments and timestamped unbooked payment attempt', () => {
    const portfolio = investmentSchema.parse({
      ...investment,
      holderIds: ['holder-marc'],
      kind: 'FUND_PORTFOLIO',
      currency: 'EUR',
      currentValue: 145000,
    });
    const attemptedTransfer = validatedExpenseSchema.parse({
      id: 'expense-marc-attempt',
      accountId: 'account-marc',
      amount: 2400,
      currency: 'EUR',
      direction: 'DEBIT',
      transactionTimestamp: '2026-09-23T19:14:00Z',
      type: 'SEPA_CREDIT_TRANSFER',
      status: 'ATTEMPTED',
    });
    assert.strictEqual(portfolio.currentValue, 145000);
    assert.strictEqual(attemptedTransfer.bookingDate, undefined);
    assert.strictEqual(attemptedTransfer.balanceAfter, undefined);
  });

  await it('preserves Dries’s known credit exposure without inventing his current balance', () => {
    const currentAccount = accountSchema.parse({
      ...account,
      id: 'account-dries',
      holderIds: ['holder-dries'],
      overdraftLimit: 1500,
      currency: 'EUR',
    });
    const card = creditCardSchema.parse({
      ...creditCard,
      holderIds: currentAccount.holderIds,
      creditLimit: 2500,
      usedCredit: 2300,
      billingAccountId: currentAccount.id,
      currency: 'EUR',
    });
    assert.strictEqual(currentAccount.balance, null);
    assert.strictEqual(currentAccount.overdraftLimit, 1500);
    assert.strictEqual(card.usedCredit, 2300);
  });

  await it('separates Kelly’s accessible funds from blocked records and an unlinked holder', () => {
    const roger = financialHolderSchema.parse({
      id: 'holder-roger',
      profileId: null,
      displayName: 'Roger',
      ...timestamps,
    });
    const currentAccount = accountSchema.parse({
      ...account,
      id: 'account-kelly-current',
      holderIds: ['holder-kelly'],
      kind: 'CURRENT',
      status: 'ACTIVE',
      currency: 'EUR',
      balance: -340,
    });
    const savings = accountSchema.parse({
      ...account,
      id: 'account-kelly-savings',
      holderIds: ['holder-kelly'],
      kind: 'SAVINGS',
      status: 'ACTIVE',
      currency: 'EUR',
      balance: 2100,
    });
    const blockedAccount = accountSchema.parse({
      ...account,
      id: 'account-kelly-joint',
      holderIds: ['holder-kelly', roger.id],
      status: 'BLOCKED',
    });
    assert.strictEqual(currentAccount.balance, -340);
    assert.strictEqual(savings.balance, 2100);
    assert.strictEqual(blockedAccount.balance, null);
    assert.strictEqual(roger.profileId, null);
  });
});

await describe('unknown values and numeric boundaries', async () => {
  await it('accepts an unassigned legacy account without filling in unknown metadata', () => {
    const legacyAccount = { ...account, id: 'acc_demo_001' };
    assert.deepStrictEqual(accountSchema.parse(legacyAccount), legacyAccount);
    assert.strictEqual(
      accountSchema.safeParse({ ...account, balance: undefined }).success,
      false
    );
  });

  await it('preserves unknown product amounts instead of replacing them with zero', () => {
    assert.deepStrictEqual(loanSchema.parse(loan), loan);
    assert.deepStrictEqual(creditCardSchema.parse(creditCard), creditCard);
    assert.deepStrictEqual(investmentSchema.parse(investment), investment);
    assert.deepStrictEqual(insuranceSchema.parse(insurance), insurance);
  });

  await it('accepts zero, negative cash balances, and over-limit card usage', () => {
    assert.strictEqual(
      accountSchema.parse({ ...account, balance: 0 }).balance,
      0
    );
    assert.strictEqual(
      accountSchema.parse({ ...account, balance: -340 }).balance,
      -340
    );
    assert.strictEqual(
      loanSchema.parse({ ...loan, outstandingBalance: 0 }).outstandingBalance,
      0
    );
    assert.strictEqual(
      creditCardSchema.parse({
        ...creditCard,
        creditLimit: 2500,
        usedCredit: 2600,
      }).usedCredit,
      2600
    );
    assert.strictEqual(
      insuranceSchema.parse({ ...insurance, isEmployerProvided: false })
        .isEmployerProvided,
      false
    );
  });

  await it('rejects negative liabilities and reserves and fractional month counts', () => {
    assert.strictEqual(
      accountSchema.safeParse({ ...account, overdraftLimit: -1 }).success,
      false
    );
    assert.strictEqual(
      creditCardSchema.safeParse({ ...creditCard, creditLimit: -1 }).success,
      false
    );
    assert.strictEqual(
      creditCardSchema.safeParse({ ...creditCard, usedCredit: -1 }).success,
      false
    );
    assert.strictEqual(
      loanSchema.safeParse({ ...loan, outstandingBalance: -1 }).success,
      false
    );
    assert.strictEqual(
      loanSchema.safeParse({ ...loan, remainingTermMonths: 1.5 }).success,
      false
    );
    assert.strictEqual(
      investmentSchema.safeParse({ ...investment, currentValue: -1 }).success,
      false
    );
    assert.strictEqual(
      investmentSchema.safeParse({ ...investment, contributionAmount: -1 })
        .success,
      false
    );
  });

  await it('validates per-person coverage without imposing an ownership split or total', () => {
    assert.strictEqual(
      insuredPersonSchema.safeParse({
        holderId: 'holder-demo',
        coveragePercentage: 101,
      }).success,
      false
    );
    assert.strictEqual(
      insuredPersonSchema.safeParse({
        holderId: 'holder-demo',
        coveragePercentage: -1,
      }).success,
      false
    );
    const fullCover = insuranceSchema.parse({
      ...insurance,
      insuredPersons: [
        { holderId: 'holder-one', coveragePercentage: 100 },
        { holderId: 'holder-two', coveragePercentage: 100 },
      ],
    });
    assert.strictEqual(fullCover.insuredPersons.length, 2);
  });

  await it('rejects unknown enum strings and unnamed holders', () => {
    assert.strictEqual(
      accountSchema.safeParse({ ...account, kind: 'CHECKING' }).success,
      false
    );
    assert.strictEqual(
      accountSchema.safeParse({ ...account, status: 'FROZEN' }).success,
      false
    );
    assert.strictEqual(
      accountSchema.safeParse({ ...account, purpose: 'COMPANY' }).success,
      false
    );
    assert.strictEqual(
      loanSchema.safeParse({ ...loan, kind: 'OVERDRAFT' }).success,
      false
    );
    assert.strictEqual(
      investmentSchema.safeParse({ ...investment, kind: 'UNCLASSIFIED' })
        .success,
      false
    );
    assert.strictEqual(
      insuranceSchema.safeParse({ ...insurance, kind: 'MEDICAL' }).success,
      false
    );
    assert.strictEqual(
      financialHolderSchema.safeParse({
        id: 'holder-demo',
        profileId: null,
        displayName: '  ',
        ...timestamps,
      }).success,
      false
    );
  });
});

await describe('profile additions', async () => {
  await it('preserves existing profile values when new unknown fields are explicitly null', () => {
    const profile = {
      ...legacyProfile,
      personalizationConsent: null,
      investmentHorizonMonths: null,
      liquidityReserveTarget: null,
    };
    assert.deepStrictEqual(profileSchema.parse(profile), profile);
    assert.strictEqual(profileSchema.safeParse(legacyProfile).success, false);
  });

  await it('keeps omitted PATCH fields absent and rejects an empty PATCH', () => {
    const patchSchema = profileSchema
      .omit({ id: true, createdAt: true, updatedAt: true })
      .partial()
      .refine((value) => Object.keys(value).length > 0);
    assert.strictEqual(patchSchema.safeParse({}).success, false);
    assert.deepStrictEqual(patchSchema.parse({ firstName: 'Changed' }), {
      firstName: 'Changed',
    });
    assert.deepStrictEqual(
      patchSchema.parse({ personalizationConsent: null }),
      { personalizationConsent: null }
    );
  });

  await it('preserves explicit consent refusal and zero values', () => {
    const profile = profileSchema.parse({
      ...legacyProfile,
      personalizationConsent: false,
      investmentHorizonMonths: 0,
      liquidityReserveTarget: 0,
    });
    assert.strictEqual(profile.personalizationConsent, false);
    assert.strictEqual(profile.investmentHorizonMonths, 0);
    assert.strictEqual(profile.liquidityReserveTarget, 0);
  });

  await it('rejects negative reserve targets and invalid investment horizons', () => {
    for (const fields of [
      { investmentHorizonMonths: -1 },
      { investmentHorizonMonths: 1.5 },
      { liquidityReserveTarget: -1 },
    ]) {
      assert.strictEqual(
        profileSchema.safeParse({
          ...legacyProfile,
          personalizationConsent: null,
          investmentHorizonMonths: null,
          liquidityReserveTarget: null,
          ...fields,
        }).success,
        false
      );
    }
  });
});
