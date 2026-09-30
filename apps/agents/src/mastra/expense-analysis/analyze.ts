import {
  type ExpenseAnalysisResult,
  expenseAnalysisResultSchema,
} from '../schemas/expense-analysis';

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
