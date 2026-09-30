import type { Expense, Investment, ProfileDetail } from '@repo/contracts';
import {
  financialGoalSchema,
  financialLiteracySchema,
  riskToleranceSchema,
} from '@repo/contracts';
import { z } from 'zod';

import type {
  AgeCategory,
  CustomerProfile,
  ExistingProductHolding,
  FinancesInput,
  InvestmentAllocationItem,
  InvestmentHorizon,
  LiquidityNeeds,
  SavingsAdviceInput,
} from '../schemas/savings-advice';

type FinancialLiteracy = z.infer<typeof financialLiteracySchema>;
type RiskTolerance = z.infer<typeof riskToleranceSchema>;
type FinancialGoal = z.infer<typeof financialGoalSchema>;

function mapFinancialLiteracy(
  value: FinancialLiteracy | null
): CustomerProfile['financialLiteracy'] {
  switch (value) {
    case 'CAPABLE':
      return 'intermediate';
    case 'EXPERT':
      return 'advanced';
    case 'LOW':
    case 'DEVELOPING':
    case null:
    default:
      return 'beginner';
  }
}

function mapRiskTolerance(
  value: RiskTolerance | null
): CustomerProfile['riskTolerance'] {
  switch (value) {
    case 'CONSERVATIVE':
      return 'low';
    case 'GROWTH':
    case 'AGGRESSIVE':
      return 'high';
    case 'MODERATE':
    case 'BALANCED':
    case null:
    default:
      return 'medium';
  }
}

function mapInvestmentHorizon(months: number | null): InvestmentHorizon {
  if (months === null) {
    return 'medium';
  }
  if (months < 36) {
    return 'short';
  }
  if (months <= 120) {
    return 'medium';
  }
  return 'long';
}

function humanizeGoal(goal: FinancialGoal): string {
  return goal.toLowerCase().replaceAll('_', ' ');
}

function ageCategoryFromDateOfBirth(dateOfBirth: string | null): AgeCategory {
  if (dateOfBirth === null) {
    return '30_45';
  }

  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) {
    return '30_45';
  }

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }

  if (age < 30) {
    return 'under_30';
  }
  if (age < 45) {
    return '30_45';
  }
  if (age < 60) {
    return '45_60';
  }
  return 'over_60';
}

function sumNullable(
  ...values: Array<number | null | undefined>
): number | undefined {
  let sum = 0;
  let hasValue = false;
  for (const value of values) {
    if (value !== null && value !== undefined) {
      sum += value;
      hasValue = true;
    }
  }
  return hasValue ? sum : undefined;
}

function mapLiquidityNeeds(
  profile: ProfileDetail,
  monthlyExpenses: number | undefined
): LiquidityNeeds {
  if (
    profile.liquidityReserveTarget !== null &&
    monthlyExpenses !== undefined &&
    monthlyExpenses > 0
  ) {
    const monthsOfCover = profile.liquidityReserveTarget / monthlyExpenses;
    if (monthsOfCover >= 6) {
      return 'high';
    }
    if (monthsOfCover >= 3) {
      return 'medium';
    }
    return 'low';
  }

  if (
    profile.goals.includes('BUY_HOME') ||
    profile.goals.includes('EMERGENCY_FUND')
  ) {
    return 'high';
  }

  return 'medium';
}

function mapCustomerProfile(
  profile: ProfileDetail,
  monthlyExpenses: number | undefined
): CustomerProfile {
  const result: CustomerProfile = {
    financialLiteracy: mapFinancialLiteracy(profile.financialLiteracy),
    riskTolerance: mapRiskTolerance(profile.riskTolerance),
    goals: profile.goals.map(humanizeGoal),
    investmentHorizon: mapInvestmentHorizon(profile.investmentHorizonMonths),
    liquidityNeeds: mapLiquidityNeeds(profile, monthlyExpenses),
    ageCategory: ageCategoryFromDateOfBirth(profile.dateOfBirth),
  };

  if (profile.notes !== null && profile.notes.length > 0) {
    result.notes = profile.notes;
  }

  return result;
}

function mapExistingProducts(
  profile: ProfileDetail
): Array<ExistingProductHolding> {
  const holder = profile.financialHolder;
  const products: Array<ExistingProductHolding> = [];

  if (holder === null) {
    return products;
  }

  for (const account of holder.accounts) {
    if (account.kind !== 'SAVINGS') {
      continue;
    }
    products.push({
      productId: 'savings-account',
      productType: 'saving',
      amountHeld: account.balance ?? 0,
      currency: account.currency ?? profile.currency,
      characteristics: account.purpose ?? undefined,
    });
  }

  for (const investment of holder.investments) {
    products.push(mapInvestmentHolding(investment, profile.currency));
  }

  return products;
}

function mapInvestmentHolding(
  investment: Investment,
  fallbackCurrency: string
): ExistingProductHolding {
  const amountHeld = investment.currentValue ?? 0;
  const currency = investment.currency ?? fallbackCurrency;

  if (investment.kind === 'PENSION_SAVINGS') {
    return {
      productId: 'pension-savings-fund',
      productType: 'saving',
      amountHeld,
      currency,
      characteristics: investment.productName ?? undefined,
    };
  }

  return {
    productId: investment.productName ?? investment.id,
    productType: 'investing',
    amountHeld,
    currency,
    characteristics: investment.productName ?? undefined,
  };
}

function mapInvestmentAllocation(
  profile: ProfileDetail
): Array<InvestmentAllocationItem> | undefined {
  const items: Array<InvestmentAllocationItem> = [];
  const holder = profile.financialHolder;

  if (holder !== null) {
    for (const investment of holder.investments) {
      if (investment.currentValue === null || investment.currentValue <= 0) {
        continue;
      }
      items.push({
        label: investment.productName ?? investment.kind ?? investment.id,
        amount: investment.currentValue,
        currency: investment.currency ?? profile.currency,
      });
    }
  }

  if (profile.pensionBalance !== null && profile.pensionBalance > 0) {
    const alreadyCounted = items.some((item) =>
      item.label.toLowerCase().includes('pension')
    );
    if (!alreadyCounted) {
      items.push({
        label: 'pension fund',
        amount: profile.pensionBalance,
        currency: profile.currency,
      });
    }
  }

  return items.length > 0 ? items : undefined;
}

function mapCurrentSavings(profile: ProfileDetail): number {
  if (profile.liquidSavings !== null) {
    return profile.liquidSavings;
  }

  const holder = profile.financialHolder;
  if (holder === null) {
    return 0;
  }

  return holder.accounts
    .filter((account) => account.kind === 'SAVINGS')
    .reduce((sum, account) => sum + (account.balance ?? 0), 0);
}

function mapFinances(
  profile: ProfileDetail,
  expenseLines?: Array<Expense>
): FinancesInput {
  const monthlyIncome = sumNullable(
    profile.monthlyNetIncome,
    profile.otherMonthlyIncome
  );
  const monthlyExpenses = sumNullable(
    profile.monthlyEssentialExpenses,
    profile.monthlyDiscretionaryExpenses
  );

  const finances: FinancesInput = {
    currentSavings: mapCurrentSavings(profile),
  };

  if (monthlyIncome !== undefined) {
    finances.monthlyIncome = monthlyIncome;
  }
  if (monthlyExpenses !== undefined) {
    finances.monthlyExpenses = monthlyExpenses;
  }

  const allocation = mapInvestmentAllocation(profile);
  if (allocation !== undefined) {
    finances.investmentAllocation = allocation;
  }

  if (expenseLines !== undefined) {
    finances.periodMonths = 3;
    if (expenseLines.length > 0) {
      finances.expenseLines = expenseLines;
    } else if (
      finances.monthlyIncome === undefined ||
      finances.monthlyExpenses === undefined
    ) {
      finances.monthlyIncome = finances.monthlyIncome ?? 0;
      finances.monthlyExpenses = finances.monthlyExpenses ?? 0;
    }
  }

  return finances;
}

export function toSavingsAdviceInput(
  profile: ProfileDetail,
  expenseLines?: Array<Expense>
): SavingsAdviceInput {
  const finances = mapFinances(profile, expenseLines);

  return {
    profile: mapCustomerProfile(profile, finances.monthlyExpenses),
    existingProducts: mapExistingProducts(profile),
    finances,
  };
}

export function needsExpenseLinesFallback(profile: ProfileDetail): boolean {
  const monthlyIncome = sumNullable(
    profile.monthlyNetIncome,
    profile.otherMonthlyIncome
  );
  const monthlyExpenses = sumNullable(
    profile.monthlyEssentialExpenses,
    profile.monthlyDiscretionaryExpenses
  );
  return monthlyIncome === undefined || monthlyExpenses === undefined;
}

export function lastThreeMonthsPeriod(now = new Date()): {
  start: string;
  end: string;
} {
  const end = now.toISOString().slice(0, 10);
  const startDate = new Date(now);
  startDate.setUTCMonth(startDate.getUTCMonth() - 3);
  const start = startDate.toISOString().slice(0, 10);
  return { start, end };
}
