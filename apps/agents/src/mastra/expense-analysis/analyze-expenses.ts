import type { Agent } from '@mastra/core/agent';

import {
  type ExpenseAnalysisInput,
  type ExpenseAnalysisResult,
  expenseAnalysisResultBaseSchema,
} from '../schemas/expense-analysis';

import { finalizeExpenseAnalysis, prepareExpenseAnalysis } from './analyze';

export async function analyzeExpenses(
  input: ExpenseAnalysisInput,
  agent: Agent
): Promise<ExpenseAnalysisResult> {
  const { context } = prepareExpenseAnalysis(input);
  const response = await agent.generate(context.prompt, {
    structuredOutput: {
      schema: expenseAnalysisResultBaseSchema,
    },
  });

  return finalizeExpenseAnalysis(response.object, context.metrics.period);
}
