import {
  type Account,
  accountSchema,
  type CreditCard,
  creditCardSchema,
  type Expense,
  type FinancialHolder,
  financialHolderSchema,
  type Insurance,
  insuranceSchema,
  type Investment,
  investmentSchema,
  type Loan,
  loanSchema,
  type Party,
  partySchema,
  type Profile,
  profileSchema,
  type Subscription,
  subscriptionSchema,
  validatedExpenseSchema,
} from '@repo/contracts';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const fixtureTimestamp = '2026-09-30T18:00:00.000Z';
export const fixtureVersion = 'hackathon-personas-2026-v1';
export const fixtureTimestamps = {
  createdAt: fixtureTimestamp,
  updatedAt: fixtureTimestamp,
};

export const sourceFiles = {
  lotte: 'F0C5UP7UH4L',
  'jonas-sarah': 'F0C6KKZLQBA',
  eva: 'F0C6KMQFYDN',
  marc: 'F0C59V0UX39',
  dries: 'F0C5L19ER6Z',
  kelly: 'F0C5T9RKJNM',
};
export type Scenario = keyof typeof sourceFiles;

export interface Provenance {
  scenario: Scenario;
  resource: string;
  id: string;
  source: string;
  syntheticFields: Array<string>;
  explanation: string;
}

export interface PersonaFixtures {
  profiles: Array<Profile>;
  holders: Array<FinancialHolder>;
  accounts: Array<Account>;
  loans: Array<Loan>;
  cards: Array<CreditCard>;
  investments: Array<Investment>;
  insurance: Array<Insurance>;
  parties: Array<Party>;
  subscriptions: Array<Subscription>;
  expenses: Array<Expense>;
  provenance: Array<Provenance>;
}

// A frozen namespace and timestamp keep IDs stable when fixture ordering changes.
export const fixtureId = (key: string): string => {
  const digest = createHash('sha256')
    .update(`${fixtureVersion}:${key}`)
    .digest('hex');
  return `01a00000-0000-7${digest.slice(0, 3)}-8${digest.slice(3, 6)}-${digest.slice(6, 18)}`;
};

interface RecordOptions<T> {
  key: string;
  scenario: Scenario;
  data: Partial<T>;
  source: string;
  syntheticFields?: Array<string>;
  explanation?: string;
}

interface PaymentOptions {
  key: string;
  scenario: Scenario;
  account: string;
  date: string;
  amount: number;
  party: string;
  description: string;
  category?: Expense['category'];
  direction?: Expense['direction'];
  type?: Expense['type'];
  purpose?: Expense['purpose'];
  status?: Expense['status'];
  timestamp?: string;
  channel?: Expense['channel'];
  subscription?: string;
  original?: string;
  counterpartyAccount?: string;
  failureReason?: string;
  source: string;
  syntheticFields?: Array<string>;
  explanation?: string;
}

export class FixtureBuilder {
  readonly fixtures: PersonaFixtures = {
    profiles: [],
    holders: [],
    accounts: [],
    loans: [],
    cards: [],
    investments: [],
    insurance: [],
    parties: [],
    subscriptions: [],
    expenses: [],
    provenance: [],
  };

  record<T>({
    key,
    scenario,
    source,
    syntheticFields = [],
    explanation = '',
  }: RecordOptions<T>): string {
    const id = fixtureId(key);
    this.fixtures.provenance.push({
      scenario,
      resource: key.slice(0, key.indexOf(':')),
      id,
      source,
      syntheticFields,
      explanation,
    });
    return id;
  }

  profile(options: RecordOptions<Profile>): string {
    const id = this.record(options);
    this.fixtures.profiles.push(
      profileSchema.parse({
        id,
        firstName: '',
        lastName: '',
        dateOfBirth: null,
        email: null,
        phone: null,
        customerReference: null,
        maritalStatus: null,
        dependentCount: 0,
        street: null,
        city: null,
        postalCode: null,
        country: 'BE',
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
        personalizationConsent: true,
        investmentHorizonMonths: null,
        liquidityReserveTarget: null,
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
        ...fixtureTimestamps,
        ...options.data,
      })
    );
    return id;
  }

  holder(options: RecordOptions<FinancialHolder>): string {
    const id = this.record(options);
    this.fixtures.holders.push(
      financialHolderSchema.parse({
        id,
        profileId: null,
        ...fixtureTimestamps,
        ...options.data,
      })
    );
    return id;
  }

  account(options: RecordOptions<Account>): string {
    const id = this.record(options);
    this.fixtures.accounts.push(
      accountSchema.parse({
        id,
        holderIds: [],
        providerName: 'KBC',
        iban: null,
        kind: 'CURRENT',
        purpose: 'PERSONAL',
        status: 'ACTIVE',
        currency: 'EUR',
        balance: null,
        balanceAsOf: null,
        overdraftLimit: null,
        ...fixtureTimestamps,
        ...options.data,
      })
    );
    return id;
  }

  loan(options: RecordOptions<Loan>): string {
    const id = this.record(options);
    this.fixtures.loans.push(
      loanSchema.parse({
        id,
        borrowerIds: [],
        providerName: 'KBC',
        productName: null,
        kind: 'MORTGAGE',
        currency: 'EUR',
        outstandingBalance: null,
        repaymentAmount: null,
        repaymentCadence: null,
        remainingTermMonths: null,
        repaymentAccountId: null,
        ...fixtureTimestamps,
        ...options.data,
      })
    );
    return id;
  }

  card(options: RecordOptions<CreditCard>): string {
    const id = this.record(options);
    this.fixtures.cards.push(
      creditCardSchema.parse({
        id,
        holderIds: [],
        providerName: 'KBC',
        productName: null,
        currency: 'EUR',
        creditLimit: null,
        usedCredit: null,
        billingAccountId: null,
        ...fixtureTimestamps,
        ...options.data,
      })
    );
    return id;
  }

  investment(options: RecordOptions<Investment>): string {
    const id = this.record(options);
    this.fixtures.investments.push(
      investmentSchema.parse({
        id,
        holderIds: [],
        providerName: 'KBC',
        productName: null,
        kind: 'PENSION_SAVINGS',
        currency: 'EUR',
        currentValue: null,
        valuationDate: null,
        contributionAmount: null,
        contributionCadence: null,
        status: 'ACTIVE',
        ...fixtureTimestamps,
        ...options.data,
      })
    );
    return id;
  }

  policy(options: RecordOptions<Insurance>): string {
    const id = this.record(options);
    this.fixtures.insurance.push(
      insuranceSchema.parse({
        id,
        policyholderIds: [],
        providerName: null,
        productName: null,
        kind: null,
        isEmployerProvided: null,
        loanId: null,
        insuredPersons: [],
        ...fixtureTimestamps,
        ...options.data,
      })
    );
    return id;
  }

  party(name: string): string {
    const id = fixtureId(`party:${name}`);
    if (!this.fixtures.parties.some((party) => party.id === id)) {
      const people = new Set([
        'Thomas',
        'Roger',
        'Kelly Vandamme',
        'New beneficiary claiming to be Jens',
      ]);
      this.fixtures.parties.push(
        partySchema.parse({
          id,
          kind: people.has(name) ? 'PERSON' : 'MERCHANT',
          name,
        })
      );
    }
    return id;
  }

  subscription(options: RecordOptions<Subscription>): string {
    const id = this.record(options);
    this.fixtures.subscriptions.push(
      subscriptionSchema.parse({
        id,
        kind: 'UNKNOWN',
        status: 'ACTIVE',
        currency: 'EUR',
        ...options.data,
      })
    );
    return id;
  }

  payment(options: PaymentOptions): string {
    const id = this.record({
      ...options,
      data: {},
      syntheticFields:
        options.type === undefined
          ? [...(options.syntheticFields ?? []), 'type']
          : options.syntheticFields,
    });
    const status = options.status ?? 'BOOKED';
    const isPosted = status === 'BOOKED' || status === 'REVERSED';
    this.fixtures.expenses.push(
      validatedExpenseSchema.parse({
        id,
        accountId: options.account,
        amount: options.amount,
        currency: 'EUR',
        direction: options.direction ?? 'DEBIT',
        bookingDate: isPosted ? options.date : undefined,
        transactionDate: isPosted ? undefined : options.date,
        transactionTimestamp: options.timestamp,
        channel: options.channel,
        type: options.type ?? 'CARD_PAYMENT',
        status,
        description: options.description,
        category: options.category,
        purpose: options.purpose,
        counterpartyId: this.party(options.party),
        subscriptionId: options.subscription,
        originalExpenseId: options.original,
        counterpartyAccountId: options.counterpartyAccount,
        failureReason: options.failureReason,
      })
    );
    return id;
  }

  transfer(
    options: Omit<
      PaymentOptions,
      'account' | 'party' | 'direction' | 'purpose' | 'type'
    > & { from: string; to: string }
  ): void {
    this.payment({
      ...options,
      key: `${options.key}:debit`,
      account: options.from,
      counterpartyAccount: options.to,
      party: 'Transfer between owned accounts',
      direction: 'DEBIT',
      purpose: 'OWN_ACCOUNT_TRANSFER',
      type: 'SEPA_CREDIT_TRANSFER',
    });
    this.payment({
      ...options,
      key: `${options.key}:credit`,
      account: options.to,
      counterpartyAccount: options.from,
      party: 'Transfer between owned accounts',
      direction: 'CREDIT',
      purpose: 'OWN_ACCOUNT_TRANSFER',
      type: 'SEPA_CREDIT_TRANSFER',
    });
  }

  finish(): PersonaFixtures {
    for (const profile of this.fixtures.profiles) {
      const origin = this.fixtures.provenance.find(
        (entry) => entry.id === profile.id
      );
      if (!origin) {
        throw new Error(`Missing profile provenance: ${profile.id}`);
      }
      const source = readFileSync(
        join(__dirname, 'sources', `${origin.scenario}.md`),
        'utf8'
      );
      const manifest = this.fixtures.provenance.filter(
        (entry) => entry.scenario === origin.scenario
      );
      profile.notes = [
        `<!-- ${fixtureVersion}:start -->`,
        `Source: slack://file/${sourceFiles[origin.scenario]}`,
        `Fixture version: ${fixtureVersion}; fixed snapshot: ${fixtureTimestamp}.`,
        'Source markdown is scenario context, including advice and app/life events; advice is not a booked transaction or owned product.',
        'Only the explicitly marked dates/amounts/classifications are demo additions. Unknown IBANs, balances and birthdays remain null. EUR and Belgium follow the source context. IDs/timestamps are synthetic infrastructure. A missing dependent count uses the schema default zero; this does not establish absence of dependents. No inferred goals, risk tolerance, insurance or forecast liabilities are added.',
        'Financial literacy was explicitly supplied by the user: Lotte EXPERT; Sarah CAPABLE; Jonas LOW; Dries LOW; Marc DEVELOPING; Eva CAPABLE; Kelly LOW.',
        source,
        '\n## Fixture provenance manifest\n',
        JSON.stringify(manifest, null, 2),
        `<!-- ${fixtureVersion}:end -->`,
      ].join('\n\n');
    }
    return this.fixtures;
  }
}
