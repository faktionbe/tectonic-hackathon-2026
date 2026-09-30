import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { advicePersonalizationAgent } from '../agents/advice-personalization-agent';
import { adviceSelectionAgent } from '../agents/advice-selection-agent';
import {
  fetchCustomerFinances,
  fetchCustomerProfile,
} from '../savings-advice/data-clients';
import { runSavingsAdviceForCustomer } from '../savings-advice/run-for-customer';
import { savingsAdviceResultSchema } from '../schemas/savings-advice';

/**
 * WARNING: These tools wrap temporary mock-backed customer-data clients.
 * Update data-clients.ts when real endpoints are available.
 */

export const fetchCustomerProfileTool = createTool({
  id: 'fetch_customer_profile',
  description:
    'Fetch a customer financial profile and existing product holdings. Uses mocked data until real APIs are wired.',
  inputSchema: z.object({
    customerId: z.string().min(1).describe('Customer identifier'),
  }),
  outputSchema: z.object({
    profile: z.unknown(),
    existingProducts: z.array(z.unknown()),
  }),
  execute: async ({ customerId }) => fetchCustomerProfile(customerId),
});

export const fetchCustomerFinancesTool = createTool({
  id: 'fetch_customer_finances',
  description:
    'Fetch customer income, expenses, and savings aggregates. Uses mocked data until real APIs are wired.',
  inputSchema: z.object({
    customerId: z.string().min(1).describe('Customer identifier'),
  }),
  outputSchema: z.object({
    finances: z.unknown(),
  }),
  execute: async ({ customerId }) => fetchCustomerFinances(customerId),
});

export const generateSavingsAdviceTool = createTool({
  id: 'generate_savings_advice',
  description:
    'Load customer profile and finances (mocked until real endpoints exist), select relevant KBC savings/investment advice, and return a personalized advice statement for the chat agent.',
  inputSchema: z.object({
    customerId: z
      .string()
      .min(1)
      .describe('Customer identifier provided by the chat agent'),
  }),
  outputSchema: savingsAdviceResultSchema,
  execute: async ({ customerId }) =>
    runSavingsAdviceForCustomer(customerId, {
      selectionAgent: adviceSelectionAgent,
      personalizationAgent: advicePersonalizationAgent,
    }),
});
