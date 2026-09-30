import { Agent } from '@mastra/core/agent';

import { advicePersonalizationSkill } from '../skills/advice-personalization';
import { adviceSelectionSkill } from '../skills/advice-selection';
import {
  fetchCustomerFinancesTool,
  fetchCustomerProfileTool,
  fetchKbcProductsTool,
} from '../tools/customer-data-tools';
import { generateSavingsAdviceTool } from '../tools/generate-savings-advice-tool';

const instructions = `You are the KBC savings and investment advice agent.

Other agents (such as the chat agent) call you over A2A to get personalized savings/investment advice for a customer.

Your only job:
1. Extract the customerId from the caller message (look for an explicit customer id, customerId field, or similar).
2. Call the generate_savings_advice tool with that customerId.
3. Return the tool result's adviceStatement clearly to the caller.
   You may briefly include the primaryStrategy and relevant product names if helpful, but the adviceStatement is the main reply.

Rules:
- Always use the generate_savings_advice tool. Do not invent finances, products, or advice yourself.
- If no customerId can be found, ask for it — do not guess.
- Do not claim you looked up live bank systems beyond what the tool returns.
- Keep the response suitable to forward directly to an end customer via the chat agent.`;

/**
 * A2A entrypoint for savings advice.
 * Card: /api/.well-known/savings-advice-agent/agent-card.json
 * Exec: /api/a2a/savings-advice-agent
 *
 * Selection and personalization run as skills on this agent.
 */
export const savingsAdviceAgent = new Agent({
  id: 'savings-advice-agent',
  name: 'Savings Advice Agent',
  description:
    'Starts savings advice for a customerId. The advice-selection skill fetches profile, finances, and catalogue data, then the advice-personalization skill returns the customer-facing statement.',
  instructions,
  model: 'openrouter/openai/gpt-5.6-terra',
  skills: [adviceSelectionSkill, advicePersonalizationSkill],
  tools: {
    generate_savings_advice: generateSavingsAdviceTool,
    fetch_customer_profile: fetchCustomerProfileTool,
    fetch_customer_finances: fetchCustomerFinancesTool,
    fetch_kbc_products: fetchKbcProductsTool,
  },
  defaultOptions: {
    maxSteps: 5,
  },
});
