import type { Expense } from '@repo/contracts';

import type {
  FinancesInput,
  InvestmentAllocationItem,
  SavingsAdviceInput,
} from '../schemas/savings-advice';

export interface SavingsAdviceMetrics {
  totalIncome: number;
  totalExpenses: number;
  currentSavings: number;
  monthlySurplus: number;
  savingsRate: number | null;
  savingsExpenseCoverageMonths: number | null;
  investmentAllocation: Array<InvestmentAllocationItem>;
  investmentAllocationTotal: number | null;
  periodMonths: number;
  dataSufficiency: {
    hasIncome: boolean;
    hasExpenses: boolean;
    hasSavings: boolean;
    usedExpenseLines: boolean;
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function deriveFromExpenseLines(
  expenseLines: Array<Expense>,
  periodMonths: number
): { monthlyIncome: number; monthlyExpenses: number } {
  let income = 0;
  let expenses = 0;

  for (const line of expenseLines) {
    if (line.direction === 'CREDIT') {
      income += line.amount;
    } else {
      expenses += line.amount;
    }
  }

  const months = Math.max(periodMonths, 1);

  return {
    monthlyIncome: income / months,
    monthlyExpenses: expenses / months,
  };
}

export function computeSavingsAdviceMetrics(
  finances: FinancesInput
): SavingsAdviceMetrics {
  const periodMonths = finances.periodMonths ?? 1;
  const usedExpenseLines =
    finances.expenseLines !== undefined && finances.expenseLines.length > 0;

  let monthlyIncome = finances.monthlyIncome;
  let monthlyExpenses = finances.monthlyExpenses;

  if (
    usedExpenseLines &&
    (monthlyIncome === undefined || monthlyExpenses === undefined)
  ) {
    const derived = deriveFromExpenseLines(
      finances.expenseLines ?? [],
      periodMonths
    );
    monthlyIncome = monthlyIncome ?? derived.monthlyIncome;
    monthlyExpenses = monthlyExpenses ?? derived.monthlyExpenses;
  }

  const totalIncome = monthlyIncome ?? 0;
  const totalExpenses = monthlyExpenses ?? 0;
  const currentSavings = finances.currentSavings;
  const monthlySurplus = totalIncome - totalExpenses;

  const savingsRate =
    totalIncome > 0 ? round2(monthlySurplus / totalIncome) : null;

  const savingsExpenseCoverageMonths =
    totalExpenses > 0 ? round2(currentSavings / totalExpenses) : null;

  const investmentAllocation = finances.investmentAllocation ?? [];
  const investmentAllocationTotal =
    investmentAllocation.length > 0
      ? round2(investmentAllocation.reduce((sum, item) => sum + item.amount, 0))
      : null;

  return {
    totalIncome: round2(totalIncome),
    totalExpenses: round2(totalExpenses),
    currentSavings: round2(currentSavings),
    monthlySurplus: round2(monthlySurplus),
    savingsRate,
    savingsExpenseCoverageMonths,
    investmentAllocation,
    investmentAllocationTotal,
    periodMonths,
    dataSufficiency: {
      hasIncome: totalIncome > 0,
      hasExpenses: totalExpenses > 0,
      hasSavings: currentSavings > 0,
      usedExpenseLines,
    },
  };
}

export function computeMetricsFromInput(
  input: SavingsAdviceInput
): SavingsAdviceMetrics {
  return computeSavingsAdviceMetrics(input.finances);
}
