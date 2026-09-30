import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { runSavingsAdviceForCustomer } from '../savings-advice/run-for-customer';
import { savingsAdviceResultSchema } from '../schemas/savings-advice';

export const generateSavingsAdviceTool = createTool({
  id: 'generate_savings_advice',
  description:
    'Run advice selection and personalization for a customerId and return the personalized savings advice statement. This tool does not load customer data itself.',
  inputSchema: z.object({
    customerId: z
      .string()
      .min(1)
      .describe('Customer identifier provided by the chat agent'),
  }),
  outputSchema: savingsAdviceResultSchema,
  execute: async ({ customerId }, context) => {
    const agent = context.mastra?.getAgentById('savings-advice-agent');
    if (!agent) {
      throw new Error('Savings advice agent is not registered');
    }

    return runSavingsAdviceForCustomer(customerId, agent);
  },
});
