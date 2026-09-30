import type {
  Account,
  CreditCard,
  Expense,
  FinancialHolder,
  Insurance,
  Investment,
  Loan,
  Party,
  Profile,
  Subscription,
} from '@repo/contracts';

import type { Prisma, PrismaClient } from '../../generated/prisma/client';

import {
  fixtureId,
  fixtureTimestamp,
  type PersonaFixtures,
} from './fixture-builder';
import { createPersonaFixtures } from './fixtures';
import { validatePersonaFixtures } from './validate-fixtures';

const timestamp = new Date(fixtureTimestamp);
const timestamps = { createdAt: timestamp, updatedAt: timestamp };
const date = (value: string | null | undefined): Date | null =>
  value == null ? null : new Date(value);

const profileRow = (value: Profile): Prisma.profileUncheckedCreateInput => ({
  id: value.id,
  first_name: value.firstName,
  last_name: value.lastName,
  date_of_birth: date(value.dateOfBirth),
  email: value.email,
  phone: value.phone,
  customer_reference: value.customerReference,
  marital_status: value.maritalStatus,
  dependent_count: value.dependentCount,
  street: value.street,
  city: value.city,
  postal_code: value.postalCode,
  country: value.country,
  housing_status: value.housingStatus,
  monthly_housing_cost: value.monthlyHousingCost,
  employment_status: value.employmentStatus,
  occupation: value.occupation,
  employer: value.employer,
  employment_start_date: date(value.employmentStartDate),
  currency: value.currency,
  monthly_net_income: value.monthlyNetIncome,
  other_monthly_income: value.otherMonthlyIncome,
  financial_literacy: value.financialLiteracy,
  risk_tolerance: value.riskTolerance,
  personalization_consent: value.personalizationConsent,
  investment_horizon_months: value.investmentHorizonMonths,
  liquidity_reserve_target: value.liquidityReserveTarget,
  goals: value.goals,
  service_interests: value.serviceInterests,
  monthly_essential_expenses: value.monthlyEssentialExpenses,
  monthly_discretionary_expenses: value.monthlyDiscretionaryExpenses,
  monthly_savings_target: value.monthlySavingsTarget,
  liquid_savings: value.liquidSavings,
  investment_balance: value.investmentBalance,
  pension_balance: value.pensionBalance,
  real_estate_value: value.realEstateValue,
  mortgage_balance: value.mortgageBalance,
  consumer_debt_balance: value.consumerDebtBalance,
  other_debt_balance: value.otherDebtBalance,
  has_life_insurance: value.hasLifeInsurance,
  has_home_insurance: value.hasHomeInsurance,
  has_health_insurance: value.hasHealthInsurance,
  has_brokerage_account: value.hasBrokerageAccount,
  notes: value.notes,
  ...timestamps,
});
const holderRow = (
  value: FinancialHolder
): Prisma.financial_holderUncheckedCreateInput => ({
  id: value.id,
  profile_id: value.profileId,
  display_name: value.displayName,
  ...timestamps,
});
const accountRow = (value: Account): Prisma.accountUncheckedCreateInput => ({
  id: value.id,
  provider_name: value.providerName,
  iban: value.iban,
  kind: value.kind,
  purpose: value.purpose,
  status: value.status,
  currency: value.currency,
  balance: value.balance,
  balance_as_of: date(value.balanceAsOf),
  overdraft_limit: value.overdraftLimit,
  ...timestamps,
});
const loanRow = (value: Loan): Prisma.loanUncheckedCreateInput => ({
  id: value.id,
  provider_name: value.providerName,
  product_name: value.productName,
  kind: value.kind,
  currency: value.currency,
  outstanding_balance: value.outstandingBalance,
  repayment_amount: value.repaymentAmount,
  repayment_cadence: value.repaymentCadence,
  remaining_term_months: value.remainingTermMonths,
  repayment_account_id: value.repaymentAccountId,
  ...timestamps,
});
const cardRow = (
  value: CreditCard
): Prisma.credit_cardUncheckedCreateInput => ({
  id: value.id,
  provider_name: value.providerName,
  product_name: value.productName,
  currency: value.currency,
  credit_limit: value.creditLimit,
  used_credit: value.usedCredit,
  billing_account_id: value.billingAccountId,
  ...timestamps,
});
const investmentRow = (
  value: Investment
): Prisma.investmentUncheckedCreateInput => ({
  id: value.id,
  provider_name: value.providerName,
  product_name: value.productName,
  kind: value.kind,
  currency: value.currency,
  current_value: value.currentValue,
  valuation_date: date(value.valuationDate),
  contribution_amount: value.contributionAmount,
  contribution_cadence: value.contributionCadence,
  status: value.status,
  ...timestamps,
});
const insuranceRow = (
  value: Insurance
): Prisma.insuranceUncheckedCreateInput => ({
  id: value.id,
  provider_name: value.providerName,
  product_name: value.productName,
  kind: value.kind,
  is_employer_provided: value.isEmployerProvided,
  loan_id: value.loanId,
  ...timestamps,
});
const partyRow = (value: Party): Prisma.partyUncheckedCreateInput => ({
  id: value.id,
  kind: value.kind,
  name: value.name,
  iban: value.iban ?? null,
  country_code: value.countryCode ?? null,
  category: value.category ?? null,
  logo_url: value.logoUrl ?? null,
  website: value.website ?? null,
  external_id: value.externalId ?? null,
  ...timestamps,
});
const subscriptionRow = (
  value: Subscription
): Prisma.subscriptionUncheckedCreateInput => ({
  id: value.id,
  account_id: value.accountId,
  counterparty_id: value.counterpartyId,
  kind: value.kind,
  mandate_id: value.mandateId ?? null,
  creditor_id: value.creditorId ?? null,
  status: value.status,
  category: value.category ?? null,
  cadence: value.cadence ?? null,
  amount: value.amount ?? null,
  currency: value.currency,
  next_payment_date: date(value.nextPaymentDate),
  first_charged_at: date(value.firstChargedAt),
  last_charged_at: date(value.lastChargedAt),
  occurrence_count: value.occurrenceCount ?? null,
  cancellable: value.cancellable ?? null,
  ...timestamps,
});
const expenseRow = (value: Expense): Prisma.expenseUncheckedCreateInput => ({
  id: value.id,
  account_id: value.accountId,
  iban: value.iban ?? null,
  amount: value.amount,
  currency: value.currency,
  direction: value.direction,
  booking_date: date(value.bookingDate),
  transaction_date: date(value.transactionDate),
  value_date: date(value.valueDate),
  transaction_timestamp: date(value.transactionTimestamp),
  type: value.type,
  status: value.status,
  failure_reason: value.failureReason ?? null,
  purpose: value.purpose ?? null,
  description: value.description ?? null,
  structured_reference: value.structuredReference ?? null,
  mcc: value.mcc ?? null,
  channel: value.channel ?? null,
  balance_after: value.balanceAfter ?? null,
  city: value.city ?? null,
  country_code: value.countryCode ?? null,
  category: value.category ?? null,
  sub_category: value.subCategory ?? null,
  essentiality: value.essentiality ?? null,
  counterparty_id: value.counterpartyId ?? null,
  counterparty_account_id: value.counterpartyAccountId ?? null,
  subscription_id: value.subscriptionId ?? null,
  original_expense_id: value.originalExpenseId ?? null,
  ...timestamps,
});

const seedParticipants = async ({
  tx,
  fixtures,
}: {
  tx: Prisma.TransactionClient;
  fixtures: PersonaFixtures;
}): Promise<void> => {
  for (const account of fixtures.accounts) {
    for (const holderId of account.holderIds) {
      const data = {
        id: fixtureId(`account-holder:${account.id}:${holderId}`),
        account_id: account.id,
        holder_id: holderId,
        ...timestamps,
      };
      await tx.account_holder.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    }
  }
  for (const loan of fixtures.loans) {
    for (const holderId of loan.borrowerIds) {
      const data = {
        id: fixtureId(`loan-borrower:${loan.id}:${holderId}`),
        loan_id: loan.id,
        holder_id: holderId,
        ...timestamps,
      };
      await tx.loan_borrower.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    }
  }
  for (const card of fixtures.cards) {
    for (const holderId of card.holderIds) {
      const data = {
        id: fixtureId(`card-holder:${card.id}:${holderId}`),
        credit_card_id: card.id,
        holder_id: holderId,
        ...timestamps,
      };
      await tx.credit_card_holder.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    }
  }
  for (const investment of fixtures.investments) {
    for (const holderId of investment.holderIds) {
      const data = {
        id: fixtureId(`investment-holder:${investment.id}:${holderId}`),
        investment_id: investment.id,
        holder_id: holderId,
        ...timestamps,
      };
      await tx.investment_holder.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    }
  }
  for (const insurance of fixtures.insurance) {
    for (const holderId of insurance.policyholderIds) {
      const data = {
        id: fixtureId(`policyholder:${insurance.id}:${holderId}`),
        insurance_id: insurance.id,
        holder_id: holderId,
        ...timestamps,
      };
      await tx.insurance_policyholder.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    }
    for (const insured of insurance.insuredPersons) {
      const data = {
        id: fixtureId(`insured-person:${insurance.id}:${insured.holderId}`),
        insurance_id: insurance.id,
        holder_id: insured.holderId,
        coverage_percentage: insured.coveragePercentage,
        ...timestamps,
      };
      await tx.insurance_insured_person.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    }
  }
};

export const seedPersonaFixtures = async (
  client: PrismaClient
): Promise<void> => {
  const fixtures = createPersonaFixtures();
  validatePersonaFixtures(fixtures);
  await client.$transaction(
    async (tx) => {
      for (const value of fixtures.profiles) {
        const data = profileRow(value);
        const existing = await tx.profile.findUnique({
          where: { id: value.id },
          select: { notes: true },
        });
        const outsideNotes = (existing?.notes ?? '')
          .replace(
            /<!-- hackathon-personas-2026-v1:start -->[\s\S]*?<!-- hackathon-personas-2026-v1:end -->/gu,
            ''
          )
          .trim();
        data.notes = outsideNotes
          ? `${outsideNotes}\n\n${value.notes}`
          : value.notes;
        await tx.profile.upsert({
          where: { id: value.id },
          create: data,
          update: data,
        });
      }
      for (const value of fixtures.holders) {
        const data = holderRow(value);
        await tx.financial_holder.upsert({
          where: { id: value.id },
          create: data,
          update: data,
        });
      }
      for (const value of fixtures.accounts) {
        const data = accountRow(value);
        await tx.account.upsert({
          where: { id: value.id },
          create: data,
          update: data,
        });
      }
      for (const value of fixtures.loans) {
        const data = loanRow(value);
        await tx.loan.upsert({
          where: { id: value.id },
          create: data,
          update: data,
        });
      }
      for (const value of fixtures.cards) {
        const data = cardRow(value);
        await tx.credit_card.upsert({
          where: { id: value.id },
          create: data,
          update: data,
        });
      }
      for (const value of fixtures.investments) {
        const data = investmentRow(value);
        await tx.investment.upsert({
          where: { id: value.id },
          create: data,
          update: data,
        });
      }
      for (const value of fixtures.insurance) {
        const data = insuranceRow(value);
        await tx.insurance.upsert({
          where: { id: value.id },
          create: data,
          update: data,
        });
      }
      await seedParticipants({ tx, fixtures });
      for (const value of fixtures.parties) {
        const data = partyRow(value);
        await tx.party.upsert({
          where: { id: value.id },
          create: data,
          update: data,
        });
      }
      for (const value of fixtures.subscriptions) {
        const data = subscriptionRow(value);
        await tx.subscription.upsert({
          where: { id: value.id },
          create: data,
          update: data,
        });
      }
      for (const value of fixtures.expenses) {
        const data = expenseRow(value);
        await tx.expense.upsert({
          where: { id: value.id },
          create: data,
          update: data,
        });
      }
    },
    { maxWait: 10000, timeout: 120000 }
  );
};
