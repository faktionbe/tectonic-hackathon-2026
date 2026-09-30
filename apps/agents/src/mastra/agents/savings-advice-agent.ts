import { Agent } from '@mastra/core/agent';

import { generateSavingsAdviceTool } from '../tools/customer-data-tools';

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
 * Production/A2A entry is this facade agent (not the Studio full-payload workflow).
 */
export const savingsAdviceAgent = new Agent({
  id: 'savings-advice-agent',
  name: 'Savings Advice Agent',
  description:
    'Fetches customer profile and finances, selects relevant KBC savings/investment advice, and returns a personalized advice statement for the chat agent.',
  instructions,
  model: 'openrouter/openai/gpt-5.6-terra',
  tools: {
    generate_savings_advice: generateSavingsAdviceTool,
  },
  defaultOptions: {
    maxSteps: 5,
  },
});
