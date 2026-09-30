import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

import { finalizeSavingsAdvice } from '../savings-advice/analyze';
import {
  personalizeSavingsAdvice,
  selectSavingsAdvice,
} from '../savings-advice/generate-advice';
import {
  adviceSelectionSchema,
  catalogueProductSchema,
  customerProfileSchema,
  existingProductHoldingSchema,
  financesInputSchema,
  savingsAdviceMetricsSchema,
  savingsAdviceRequestSchema,
  savingsAdviceResultSchema,
} from '../schemas/savings-advice';

const selectedSchema = z.object({
  selection: adviceSelectionSchema,
  profile: customerProfileSchema,
  existingProducts: z.array(existingProductHoldingSchema),
  finances: financesInputSchema,
  metrics: savingsAdviceMetricsSchema,
  catalogue: z.array(catalogueProductSchema),
  literacyLevelUsed: customerProfileSchema.shape.financialLiteracy,
});

const personalizedSchema = z.object({
  selection: adviceSelectionSchema,
  adviceStatement: z.string().min(1),
  literacyLevelUsed: selectedSchema.shape.literacyLevelUsed,
  metrics: savingsAdviceMetricsSchema,
});

const selectAdviceStep = createStep({
  id: 'selectAdvice',
  description:
    'Fetch profile, finances, and catalogue with tools, then select an advice strategy',
  inputSchema: savingsAdviceRequestSchema,
  outputSchema: selectedSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById('savings-advice-agent');
    const selected = await selectSavingsAdvice(inputData.customerId, agent);

    return {
      selection: selected.selection,
      profile: selected.input.profile,
      existingProducts: selected.input.existingProducts,
      finances: selected.input.finances,
      metrics: selected.metrics,
      catalogue: selected.catalogue,
      literacyLevelUsed: selected.literacyLevelUsed,
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
    const agent = mastra.getAgentById('savings-advice-agent');
    const adviceStatement = await personalizeSavingsAdvice(agent, {
      selection: inputData.selection,
      input: {
        profile: inputData.profile,
        existingProducts: inputData.existingProducts,
        finances: inputData.finances,
      },
      metrics: inputData.metrics,
      catalogue: inputData.catalogue,
      literacyLevelUsed: inputData.literacyLevelUsed,
    });

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
    'Fetch customer data with tools, select savings/investment advice, and generate a customer-facing statement',
  inputSchema: savingsAdviceRequestSchema,
  outputSchema: savingsAdviceResultSchema,
})
  .then(selectAdviceStep)
  .then(personalizeAdviceStep)
  .then(finalizeStep)
  .commit();
