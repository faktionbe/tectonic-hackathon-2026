import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

import {
  finalizeExpenseAnalysis,
  prepareExpenseAnalysis,
} from '../expense-analysis/analyze';
import { generateInsights } from '../expense-analysis/generate-insights';
import {
  expenseAnalysisInputSchema,
  expenseAnalysisResultBaseSchema,
  expenseAnalysisResultSchema,
} from '../schemas/expense-analysis';
import { expenseAnalysisWithInsightsSchema } from '../schemas/financial-insight';

const preparedSchema = z.object({
  input: expenseAnalysisInputSchema,
  prompt: z.string(),
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
});

const prepareStep = createStep({
  id: 'prepare',
  description:
    'Join expenses with parties/subscriptions and compute deterministic metrics',
  inputSchema: expenseAnalysisInputSchema,
  outputSchema: preparedSchema,
  execute: async ({ inputData }) => {
    const { context } = prepareExpenseAnalysis(inputData);

    return {
      input: inputData,
      prompt: context.prompt,
      period: context.metrics.period,
    };
  },
});

const classifyStep = createStep({
  id: 'classify',
  description: 'Run the expense insight agent with structured output',
  inputSchema: preparedSchema,
  outputSchema: z.object({
    period: preparedSchema.shape.period,
    rawResult: z.unknown(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById('expense-insight-agent');
    const response = await agent.generate(inputData.prompt, {
      structuredOutput: {
        schema: expenseAnalysisResultBaseSchema,
      },
    });

    return {
      period: inputData.period,
      rawResult: response.object,
    };
  },
});

const finalizeStep = createStep({
  id: 'finalize',
  description:
    'Validate structured detection output and ensure period is present',
  inputSchema: z.object({
    period: preparedSchema.shape.period,
    rawResult: z.unknown(),
  }),
  outputSchema: expenseAnalysisResultSchema,
  execute: async ({ inputData }) =>
    finalizeExpenseAnalysis(inputData.rawResult, inputData.period),
});

const generateInsightsStep = createStep({
  id: 'generateInsights',
  description:
    'Generate user-facing insights with suggested actions for detected use cases',
  inputSchema: expenseAnalysisResultSchema,
  outputSchema: expenseAnalysisWithInsightsSchema,
  execute: async ({ inputData, mastra }) => {
    const copyAgent = mastra.getAgentById('expense-insight-copy-agent');
    return generateInsights(inputData, copyAgent);
  },
});

export const expenseAnalysisWorkflow = createWorkflow({
  id: 'expense-analysis',
  description:
    'Analyze expenses, classify use cases, and generate user-facing insights',
  inputSchema: expenseAnalysisInputSchema,
  outputSchema: expenseAnalysisWithInsightsSchema,
})
  .then(prepareStep)
  .then(classifyStep)
  .then(finalizeStep)
  .then(generateInsightsStep)
  .commit();
