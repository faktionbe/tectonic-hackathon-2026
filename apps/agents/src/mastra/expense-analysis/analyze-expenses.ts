import type { Agent } from '@mastra/core/agent';
import { z } from 'zod';

import {
  analysisPeriodSchema,
  type ExpenseAnalysisRequest,
  type ExpenseAnalysisResult,
  expenseAnalysisResultBaseSchema,
} from '../schemas/expense-analysis';
import { labelSelectionSkill } from '../skills/label-selection';
import {
  assertRequiredToolCalls,
  requireToolResult,
} from '../tools/required-tool-calls';
import { EXPENSE_ANALYSIS_TOOL_IDS } from '../tools/transaction-data-tools';

import { finalizeExpenseAnalysis } from './analyze';
import { buildExpenseAnalysisPrompt } from './build-context';

const LABEL_SELECTION_MAX_STEPS = 8;

const metricsToolResultSchema = z.object({
  period: analysisPeriodSchema,
});

export async function analyzeExpenses(
  input: ExpenseAnalysisRequest,
  agent: Agent
): Promise<ExpenseAnalysisResult> {
  const response = await agent.generate(buildExpenseAnalysisPrompt(input), {
    instructions: labelSelectionSkill.instructions,
    activeTools: [...EXPENSE_ANALYSIS_TOOL_IDS],
    maxSteps: LABEL_SELECTION_MAX_STEPS,
    structuredOutput: {
      schema: expenseAnalysisResultBaseSchema,
    },
  });

  const toolResults = assertRequiredToolCalls(response, [
    ...EXPENSE_ANALYSIS_TOOL_IDS,
  ]);
  const metricsResult = metricsToolResultSchema.parse(
    requireToolResult(toolResults, 'compute_expense_metrics')
  );

  return finalizeExpenseAnalysis(response.object, metricsResult.period);
}
