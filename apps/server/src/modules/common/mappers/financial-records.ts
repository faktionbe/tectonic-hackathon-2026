import type {
  Account,
  CreditCard,
  Expense,
  ExpenseDetail,
  ExpenseListItem,
  FinancialHolder,
  Insurance,
  Investment,
  LinkedAccountSummary,
  LinkedPartySummary,
  LinkedSubscriptionSummary,
  Loan,
  Party,
  ProfileFinancialPosition,
  Subscription,
  SubscriptionDetail,
  SubscriptionListItem,
} from '@repo/contracts';
import {
  accountSchema,
  creditCardSchema,
  expenseDetailSchema,
  expenseListItemSchema,
  expenseSchema,
  financialHolderSchema,
  insuranceSchema,
  investmentSchema,
  linkedAccountSummarySchema,
  linkedPartySummarySchema,
  linkedSubscriptionSummarySchema,
  loanSchema,
  partySchema,
  profileFinancialPositionSchema,
  subscriptionDetailSchema,
  subscriptionListItemSchema,
  subscriptionSchema,
} from '@repo/contracts';
import { Prisma } from '@repo/database';

import {
  orUndefined,
  toIsoDateTime,
  toNullableIsoDate,
  toNullableIsoDateTime,
  toOptIsoDate,
  toOptIsoDateTime,
} from '@/modules/common/utils/serialization';

interface DecimalValue {
  toNumber: () => number;
}

const toOptionalDecimal = (value: DecimalValue | null): number | undefined => {
  if (value === null) {
    return undefined;
  }
  return value.toNumber();
};

const toNullableDecimal = (value: DecimalValue | null): number | null => {
  if (value === null) {
    return null;
  }
  return value.toNumber();
};

const toCurrency = (value: string): string => value.trim();

const toNullableCurrency = (value: string | null): string | null => {
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

type ExpenseScalars = Prisma.expenseGetPayload<Record<string, never>>;
type SubscriptionScalars = Prisma.subscriptionGetPayload<Record<string, never>>;
type PartyScalars = Prisma.partyGetPayload<Record<string, never>>;
type AccountScalars = Prisma.accountGetPayload<Record<string, never>>;
type AccountWithHolders = Prisma.accountGetPayload<{
  include: { holders: true };
}>;
type LoanWithBorrowers = Prisma.loanGetPayload<{
  include: { borrowers: true };
}>;
type CreditCardWithHolders = Prisma.credit_cardGetPayload<{
  include: { holders: true };
}>;
type InvestmentWithHolders = Prisma.investmentGetPayload<{
  include: { holders: true };
}>;
type InsuranceWithPeople = Prisma.insuranceGetPayload<{
  include: { policyholders: true; insured_persons: true };
}>;

export const expenseListInclude = {
  account: true,
  counterparty: true,
  subscription: true,
} satisfies Prisma.expenseInclude;

export const expenseDetailInclude = {
  account: { include: { holders: true } },
  counterparty: true,
  counterparty_account: { include: { holders: true } },
  subscription: true,
  original_expense: true,
  related_expenses: true,
} satisfies Prisma.expenseInclude;

export type ExpenseListRow = Prisma.expenseGetPayload<{
  include: typeof expenseListInclude;
}>;

export type ExpenseDetailRow = Prisma.expenseGetPayload<{
  include: typeof expenseDetailInclude;
}>;

export const subscriptionListInclude = {
  account: true,
  counterparty: true,
} satisfies Prisma.subscriptionInclude;

export const subscriptionDetailInclude = {
  account: { include: { holders: true } },
  counterparty: true,
  expenses: true,
} satisfies Prisma.subscriptionInclude;

export type SubscriptionListRow = Prisma.subscriptionGetPayload<{
  include: typeof subscriptionListInclude;
}>;

export type SubscriptionDetailRow = Prisma.subscriptionGetPayload<{
  include: typeof subscriptionDetailInclude;
}>;

export const profileListInclude = {
  financial_holder: true,
} satisfies Prisma.profileInclude;

export const profileDetailInclude = {
  financial_holder: {
    include: {
      accounts: {
        include: { account: { include: { holders: true } } },
      },
      loans: {
        include: { loan: { include: { borrowers: true } } },
      },
      credit_cards: {
        include: { credit_card: { include: { holders: true } } },
      },
      investments: {
        include: { investment: { include: { holders: true } } },
      },
      insurance_policies: {
        include: {
          insurance: {
            include: { policyholders: true, insured_persons: true },
          },
        },
      },
      insurance_coverages: {
        include: {
          insurance: {
            include: { policyholders: true, insured_persons: true },
          },
        },
      },
    },
  },
} satisfies Prisma.profileInclude;

export type ProfileListRow = Prisma.profileGetPayload<{
  include: typeof profileListInclude;
}>;

export type ProfileDetailRow = Prisma.profileGetPayload<{
  include: typeof profileDetailInclude;
}>;

type FinancialHolderWithProducts = NonNullable<
  ProfileDetailRow['financial_holder']
>;

export const toExpense = (row: ExpenseScalars): Expense =>
  expenseSchema.parse({
    id: row.id,
    accountId: row.account_id,
    iban: orUndefined(row.iban),
    amount: row.amount.toNumber(),
    currency: toCurrency(row.currency),
    direction: row.direction,
    bookingDate: toOptIsoDate(row.booking_date),
    transactionDate: toOptIsoDate(row.transaction_date),
    valueDate: toOptIsoDate(row.value_date),
    transactionTimestamp: toOptIsoDateTime(row.transaction_timestamp),
    type: row.type,
    status: row.status,
    purpose: orUndefined(row.purpose),
    failureReason: orUndefined(row.failure_reason),
    originalExpenseId: orUndefined(row.original_expense_id),
    counterpartyAccountId: orUndefined(row.counterparty_account_id),
    description: orUndefined(row.description),
    structuredReference: orUndefined(row.structured_reference),
    mcc: orUndefined(row.mcc),
    channel: orUndefined(row.channel),
    balanceAfter: toOptionalDecimal(row.balance_after),
    city: orUndefined(row.city),
    countryCode: orUndefined(row.country_code),
    category: orUndefined(row.category),
    subCategory: orUndefined(row.sub_category),
    essentiality: orUndefined(row.essentiality),
    counterpartyId: orUndefined(row.counterparty_id),
    subscriptionId: orUndefined(row.subscription_id),
  });

export const toParty = (row: PartyScalars): Party =>
  partySchema.parse({
    id: row.id,
    kind: row.kind,
    name: row.name,
    iban: orUndefined(row.iban),
    countryCode: orUndefined(row.country_code),
    category: orUndefined(row.category),
    logoUrl: orUndefined(row.logo_url),
    website: orUndefined(row.website),
    externalId: orUndefined(row.external_id),
  });

export const toLinkedPartySummary = (row: PartyScalars): LinkedPartySummary =>
  linkedPartySummarySchema.parse({
    id: row.id,
    kind: row.kind,
    name: row.name,
    category: orUndefined(row.category),
  });

export const toAccount = (row: AccountWithHolders): Account =>
  accountSchema.parse({
    id: row.id,
    holderIds: row.holders.map((holder) => holder.holder_id),
    providerName: row.provider_name,
    iban: row.iban,
    kind: row.kind,
    purpose: row.purpose,
    status: row.status,
    currency: toNullableCurrency(row.currency),
    balance: toNullableDecimal(row.balance),
    balanceAsOf: toNullableIsoDateTime(row.balance_as_of),
    overdraftLimit: toNullableDecimal(row.overdraft_limit),
    createdAt: toIsoDateTime(row.createdAt),
    updatedAt: toIsoDateTime(row.updatedAt),
  });

export const toLinkedAccountSummary = (
  row: AccountScalars
): LinkedAccountSummary =>
  linkedAccountSummarySchema.parse({
    id: row.id,
    providerName: row.provider_name,
    iban: row.iban,
    kind: row.kind,
    currency: toNullableCurrency(row.currency),
    status: row.status,
  });

export const toSubscription = (row: SubscriptionScalars): Subscription =>
  subscriptionSchema.parse({
    id: row.id,
    accountId: row.account_id,
    counterpartyId: row.counterparty_id,
    kind: row.kind,
    mandateId: orUndefined(row.mandate_id),
    creditorId: orUndefined(row.creditor_id),
    status: row.status,
    category: orUndefined(row.category),
    cadence: orUndefined(row.cadence),
    amount: toOptionalDecimal(row.amount),
    currency: toCurrency(row.currency),
    nextPaymentDate: toOptIsoDate(row.next_payment_date),
    firstChargedAt: toOptIsoDate(row.first_charged_at),
    lastChargedAt: toOptIsoDate(row.last_charged_at),
    occurrenceCount: orUndefined(row.occurrence_count),
    cancellable: orUndefined(row.cancellable),
  });

export const toLinkedSubscriptionSummary = (
  row: SubscriptionScalars
): LinkedSubscriptionSummary => {
  const subscription = toSubscription(row);
  return linkedSubscriptionSummarySchema.parse({
    id: subscription.id,
    kind: subscription.kind,
    status: subscription.status,
    category: subscription.category,
    cadence: subscription.cadence,
    amount: subscription.amount,
    currency: subscription.currency,
  });
};

const toLoan = (row: LoanWithBorrowers): Loan =>
  loanSchema.parse({
    id: row.id,
    borrowerIds: row.borrowers.map((borrower) => borrower.holder_id),
    providerName: row.provider_name,
    productName: row.product_name,
    kind: row.kind,
    currency: toNullableCurrency(row.currency),
    outstandingBalance: toNullableDecimal(row.outstanding_balance),
    repaymentAmount: toNullableDecimal(row.repayment_amount),
    repaymentCadence: row.repayment_cadence,
    remainingTermMonths: row.remaining_term_months,
    repaymentAccountId: row.repayment_account_id,
    createdAt: toIsoDateTime(row.createdAt),
    updatedAt: toIsoDateTime(row.updatedAt),
  });

const toCreditCard = (row: CreditCardWithHolders): CreditCard =>
  creditCardSchema.parse({
    id: row.id,
    holderIds: row.holders.map((holder) => holder.holder_id),
    providerName: row.provider_name,
    productName: row.product_name,
    currency: toNullableCurrency(row.currency),
    creditLimit: toNullableDecimal(row.credit_limit),
    usedCredit: toNullableDecimal(row.used_credit),
    billingAccountId: row.billing_account_id,
    createdAt: toIsoDateTime(row.createdAt),
    updatedAt: toIsoDateTime(row.updatedAt),
  });

const toInvestment = (row: InvestmentWithHolders): Investment =>
  investmentSchema.parse({
    id: row.id,
    holderIds: row.holders.map((holder) => holder.holder_id),
    providerName: row.provider_name,
    productName: row.product_name,
    kind: row.kind,
    currency: toNullableCurrency(row.currency),
    currentValue: toNullableDecimal(row.current_value),
    valuationDate: toNullableIsoDate(row.valuation_date),
    contributionAmount: toNullableDecimal(row.contribution_amount),
    contributionCadence: row.contribution_cadence,
    status: row.status,
    createdAt: toIsoDateTime(row.createdAt),
    updatedAt: toIsoDateTime(row.updatedAt),
  });

const toInsurance = (row: InsuranceWithPeople): Insurance =>
  insuranceSchema.parse({
    id: row.id,
    policyholderIds: row.policyholders.map((link) => link.holder_id),
    providerName: row.provider_name,
    productName: row.product_name,
    kind: row.kind,
    isEmployerProvided: row.is_employer_provided,
    loanId: row.loan_id,
    insuredPersons: row.insured_persons.map((person) => ({
      holderId: person.holder_id,
      coveragePercentage: toNullableDecimal(person.coverage_percentage),
    })),
    createdAt: toIsoDateTime(row.createdAt),
    updatedAt: toIsoDateTime(row.updatedAt),
  });

export const toFinancialHolder = (
  row: Prisma.financial_holderGetPayload<Record<string, never>>
): FinancialHolder =>
  financialHolderSchema.parse({
    id: row.id,
    profileId: row.profile_id,
    displayName: row.display_name,
    createdAt: toIsoDateTime(row.createdAt),
    updatedAt: toIsoDateTime(row.updatedAt),
  });

export const toProfileFinancialPosition = (
  row: FinancialHolderWithProducts
): ProfileFinancialPosition =>
  profileFinancialPositionSchema.parse({
    ...toFinancialHolder(row),
    accounts: row.accounts.map((link) => toAccount(link.account)),
    loans: row.loans.map((link) => toLoan(link.loan)),
    creditCards: row.credit_cards.map((link) => toCreditCard(link.credit_card)),
    investments: row.investments.map((link) => toInvestment(link.investment)),
    insurancePolicies: row.insurance_policies.map((link) =>
      toInsurance(link.insurance)
    ),
    insuranceCoverages: row.insurance_coverages.map((link) => ({
      ...toInsurance(link.insurance),
      coveragePercentage: toNullableDecimal(link.coverage_percentage),
    })),
  });

export const toExpenseListItem = (row: ExpenseListRow): ExpenseListItem =>
  expenseListItemSchema.parse({
    ...toExpense(row),
    account: toLinkedAccountSummary(row.account),
    counterparty:
      row.counterparty === null ? null : toLinkedPartySummary(row.counterparty),
    subscription:
      row.subscription === null
        ? null
        : toLinkedSubscriptionSummary(row.subscription),
  });

export const toExpenseDetail = (row: ExpenseDetailRow): ExpenseDetail =>
  expenseDetailSchema.parse({
    ...toExpense(row),
    account: toAccount(row.account),
    counterparty: row.counterparty === null ? null : toParty(row.counterparty),
    counterpartyAccount:
      row.counterparty_account === null
        ? null
        : toAccount(row.counterparty_account),
    subscription:
      row.subscription === null ? null : toSubscription(row.subscription),
    originalExpense:
      row.original_expense === null ? null : toExpense(row.original_expense),
    relatedExpenses: row.related_expenses.map(toExpense),
  });

export const toSubscriptionListItem = (
  row: SubscriptionListRow
): SubscriptionListItem =>
  subscriptionListItemSchema.parse({
    ...toSubscription(row),
    account: toLinkedAccountSummary(row.account),
    counterparty: toLinkedPartySummary(row.counterparty),
  });

export const toSubscriptionDetail = (
  row: SubscriptionDetailRow
): SubscriptionDetail =>
  subscriptionDetailSchema.parse({
    ...toSubscription(row),
    account: toAccount(row.account),
    counterparty: toParty(row.counterparty),
    expenses: row.expenses.map(toExpense),
  });
