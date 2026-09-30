import { createStep, createWorkflow } from '@mastra/core/workflows';

import { analyzeExpenses } from '../expense-analysis/analyze-expenses';
import { generateInsights } from '../expense-analysis/generate-insights';
import {
  expenseAnalysisRequestSchema,
  expenseAnalysisResultSchema,
} from '../schemas/expense-analysis';
import { expenseAnalysisWithInsightsSchema } from '../schemas/financial-insight';

const classifyStep = createStep({
  id: 'classify',
  description:
    'Load transactions with tools and classify use cases with structured output',
  inputSchema: expenseAnalysisRequestSchema,
  outputSchema: expenseAnalysisResultSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById('expense-insight-agent');
    return analyzeExpenses(inputData, agent);
  },
});

const generateInsightsStep = createStep({
  id: 'generateInsights',
  description:
    'Generate user-facing insights with suggested actions for detected use cases',
  inputSchema: expenseAnalysisResultSchema,
  outputSchema: expenseAnalysisWithInsightsSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById('expense-insight-agent');
    return generateInsights(inputData, agent);
  },
});

export const expenseAnalysisWorkflow = createWorkflow({
  id: 'expense-analysis',
  description:
    'Fetch a customer expense dataset, classify use cases, and generate user-facing insights',
  inputSchema: expenseAnalysisRequestSchema,
  outputSchema: expenseAnalysisWithInsightsSchema,
})
  .then(classifyStep)
  .then(generateInsightsStep)
  .commit();
