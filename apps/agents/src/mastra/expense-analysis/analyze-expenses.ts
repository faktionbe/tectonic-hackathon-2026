import type { Agent } from '@mastra/core/agent';
import { expenseSchema, partySchema } from '@repo/contracts';
import { z } from 'zod';

import {
  analysisPeriodSchema,
  expenseAnalysisModelOutputSchema,
  type ExpenseAnalysisRequest,
  type UseCaseResult,
} from '../schemas/expense-analysis';
import { expenseMetricsSchema } from '../schemas/expense-metrics';
import type { LabelFacts } from '../schemas/financial-insight';
import { labelSelectionSkill } from '../skills/label-selection';
import {
  assertRequiredToolCalls,
  requireToolResult,
} from '../tools/required-tool-calls';
import { EXPENSE_ANALYSIS_TOOL_IDS } from '../tools/transaction-data-tools';

import { repairExpenseAnalysis } from './analyze';
import { buildExpenseAnalysisPrompt } from './build-context';
import { attachInsightFacts } from './insight-facts';

const LABEL_SELECTION_MAX_STEPS = 8;

const expensesToolResultSchema = z.object({
  expenses: z.array(expenseSchema),
});

const partiesToolResultSchema = z.object({
  parties: z.array(partySchema),
});

const metricsToolResultSchema = z.object({
  period: analysisPeriodSchema,
  metrics: expenseMetricsSchema,
});

export interface AnalyzedExpenses {
  period: { start: string; end: string };
  useCases: Array<UseCaseResult>;
  factsByLabel: Partial<Record<UseCaseResult['label'], LabelFacts>>;
}

export async function analyzeExpenses(
  input: ExpenseAnalysisRequest,
  agent: Agent
): Promise<AnalyzedExpenses> {
  const response = await agent.generate(buildExpenseAnalysisPrompt(input), {
    instructions: labelSelectionSkill.instructions,
    activeTools: [...EXPENSE_ANALYSIS_TOOL_IDS],
    maxSteps: LABEL_SELECTION_MAX_STEPS,
    structuredOutput: {
      schema: expenseAnalysisModelOutputSchema,
    },
  });

  const toolResults = assertRequiredToolCalls(response, [
    ...EXPENSE_ANALYSIS_TOOL_IDS,
  ]);
  const expensesResult = expensesToolResultSchema.parse(
    requireToolResult(toolResults, 'fetch_expenses')
  );
  const partiesResult = partiesToolResultSchema.parse(
    requireToolResult(toolResults, 'fetch_parties')
  );
  const metricsResult = metricsToolResultSchema.parse(
    requireToolResult(toolResults, 'compute_expense_metrics')
  );

  const repaired = repairExpenseAnalysis(
    response.object,
    metricsResult.period,
    new Set(expensesResult.expenses.map((expense) => expense.id))
  );

  return attachInsightFacts(repaired, {
    expenses: expensesResult.expenses,
    parties: partiesResult.parties,
    metrics: metricsResult.metrics,
  });
}
