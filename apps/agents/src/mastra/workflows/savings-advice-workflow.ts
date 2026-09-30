import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

import {
  finalizeAdviceSelection,
  finalizeSavingsAdvice,
  prepareSavingsAdvice,
} from '../savings-advice/analyze';
import { buildPersonalizationPrompt } from '../savings-advice/build-context';
import {
  advicePersonalizationBaseSchema,
  adviceSelectionBaseSchema,
  adviceSelectionSchema,
  catalogueProductSchema,
  savingsAdviceInputSchema,
  savingsAdviceMetricsSchema,
  savingsAdviceResultSchema,
} from '../schemas/savings-advice';

/**
 * Full-payload Studio/debug workflow.
 * Production and A2A entry is `savingsAdviceAgent` (customerId → mocked data clients → pipeline).
 */

const preparedSchema = z.object({
  input: savingsAdviceInputSchema,
  selectionPrompt: z.string(),
  catalogueIds: z.array(z.string()),
  catalogue: z.array(catalogueProductSchema),
  metrics: savingsAdviceMetricsSchema,
  literacyLevelUsed:
    savingsAdviceInputSchema.shape.profile.shape.financialLiteracy,
});

const selectedSchema = z.object({
  input: savingsAdviceInputSchema,
  selection: adviceSelectionSchema,
  catalogue: z.array(catalogueProductSchema),
  metrics: savingsAdviceMetricsSchema,
  literacyLevelUsed: preparedSchema.shape.literacyLevelUsed,
});

const personalizedSchema = z.object({
  selection: adviceSelectionSchema,
  adviceStatement: z.string().min(1),
  literacyLevelUsed: preparedSchema.shape.literacyLevelUsed,
  metrics: savingsAdviceMetricsSchema,
});

const prepareStep = createStep({
  id: 'prepare',
  description:
    'Compute financial metrics and build the advice-selection prompt with catalogue context',
  inputSchema: savingsAdviceInputSchema,
  outputSchema: preparedSchema,
  execute: async ({ inputData }) => {
    const { context } = prepareSavingsAdvice(inputData);

    return {
      input: inputData,
      selectionPrompt: context.selectionPrompt,
      catalogueIds: context.catalogueIds,
      catalogue: context.catalogue,
      metrics: context.metrics,
      literacyLevelUsed: inputData.profile.financialLiteracy,
    };
  },
});

const selectAdviceStep = createStep({
  id: 'selectAdvice',
  description: 'Run the advice selection agent with structured output',
  inputSchema: preparedSchema,
  outputSchema: selectedSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById('advice-selection-agent');
    const response = await agent.generate(inputData.selectionPrompt, {
      structuredOutput: {
        schema: adviceSelectionBaseSchema,
      },
    });

    const selection = finalizeAdviceSelection(
      response.object,
      inputData.catalogueIds
    );

    return {
      input: inputData.input,
      selection,
      catalogue: inputData.catalogue,
      metrics: inputData.metrics,
      literacyLevelUsed: inputData.literacyLevelUsed,
    };
  },
});

const personalizeAdviceStep = createStep({
  id: 'personalizeAdvice',
  description:
    'Generate a literacy-adapted advice statement without changing the recommendation',
  inputSchema: selectedSchema,
  outputSchema: personalizedSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById('advice-personalization-agent');

    const prompt = buildPersonalizationPrompt({
      input: inputData.input,
      metrics: inputData.metrics,
      selection: inputData.selection,
      catalogue: inputData.catalogue,
    });

    const response = await agent.generate(prompt, {
      structuredOutput: {
        schema: advicePersonalizationBaseSchema,
      },
    });

    const personalized = advicePersonalizationBaseSchema.safeParse(
      response.object
    );
    const adviceStatement =
      personalized.success &&
      personalized.data.adviceStatement.trim().length > 0
        ? personalized.data.adviceStatement
        : inputData.selection.rationale;

    return {
      selection: inputData.selection,
      adviceStatement,
      literacyLevelUsed: inputData.literacyLevelUsed,
      metrics: inputData.metrics,
    };
  },
});

const finalizeStep = createStep({
  id: 'finalize',
  description: 'Validate the final personalized savings advice result',
  inputSchema: personalizedSchema,
  outputSchema: savingsAdviceResultSchema,
  execute: async ({ inputData }) =>
    finalizeSavingsAdvice({
      selection: inputData.selection,
      adviceStatement: inputData.adviceStatement,
      literacyLevelUsed: inputData.literacyLevelUsed,
      metrics: inputData.metrics,
    }),
});

export const savingsAdviceWorkflow = createWorkflow({
  id: 'savings-advice',
  description:
    'Select personalized savings/investment advice and generate a customer-facing statement',
  inputSchema: savingsAdviceInputSchema,
  outputSchema: savingsAdviceResultSchema,
})
  .then(prepareStep)
  .then(selectAdviceStep)
  .then(personalizeAdviceStep)
  .then(finalizeStep)
  .commit();
