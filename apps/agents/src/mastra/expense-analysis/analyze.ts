import type { ExpenseAnalysisInput } from '../schemas/expense-analysis';
import {
  type ExpenseAnalysisResult,
  expenseAnalysisResultSchema,
} from '../schemas/expense-analysis';

import type { AnalysisContext } from './build-context';
import { buildAnalysisContext } from './build-context';

export interface PreparedExpenseAnalysis {
  context: AnalysisContext;
}

export function prepareExpenseAnalysis(
  input: ExpenseAnalysisInput
): PreparedExpenseAnalysis {
  return {
    context: buildAnalysisContext(input),
  };
}

export function finalizeExpenseAnalysis(
  raw: unknown,
  fallbackPeriod: { start: string; end: string }
): ExpenseAnalysisResult {
  const candidate =
    raw && typeof raw === 'object'
      ? {
          ...(raw as Record<string, unknown>),
          period:
            (raw as { period?: { start?: string; end?: string } }).period ??
            fallbackPeriod,
        }
      : raw;

  return expenseAnalysisResultSchema.parse(candidate);
}
