import type {
  AdviceSelection,
  SavingsAdviceResult,
  SupportingNumbers,
} from '../schemas/savings-advice';
import {
  adviceSelectionSchema,
  savingsAdviceResultSchema,
} from '../schemas/savings-advice';

import type { SavingsAdviceMetrics } from './metrics';

export function toSupportingNumbers(
  metrics: SavingsAdviceMetrics
): SupportingNumbers {
  return {
    totalIncome: metrics.totalIncome,
    totalExpenses: metrics.totalExpenses,
    currentSavings: metrics.currentSavings,
    monthlySurplus: metrics.monthlySurplus,
    savingsRate: metrics.savingsRate,
    savingsExpenseCoverageMonths: metrics.savingsExpenseCoverageMonths,
    investmentAllocationTotal: metrics.investmentAllocationTotal,
  };
}

export function finalizeAdviceSelection(
  raw: unknown,
  catalogueIds: Array<string>
): AdviceSelection {
  const parsed = adviceSelectionSchema.parse(raw);
  const allowed = new Set(catalogueIds);

  const relevantProductIds = parsed.relevantProductIds.filter((id) =>
    allowed.has(id)
  );

  return {
    ...parsed,
    relevantProductIds,
  };
}

export function finalizeSavingsAdvice(params: {
  selection: AdviceSelection;
  adviceStatement: string;
  literacyLevelUsed: SavingsAdviceResult['literacyLevelUsed'];
  metrics: SavingsAdviceMetrics;
}): SavingsAdviceResult {
  return savingsAdviceResultSchema.parse({
    primaryStrategy: params.selection.primaryStrategy,
    secondaryStrategy: params.selection.secondaryStrategy,
    relevantProductIds: params.selection.relevantProductIds,
    keyFactors: params.selection.keyFactors,
    rationale: params.selection.rationale,
    confidence: params.selection.confidence,
    adviceStatement: params.adviceStatement,
    literacyLevelUsed: params.literacyLevelUsed,
    supportingNumbers: toSupportingNumbers(params.metrics),
  });
}
