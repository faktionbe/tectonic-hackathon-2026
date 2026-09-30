import { A2AAgent } from '@mastra/core/a2a';

import { env } from '@/env';

export const SAVINGS_ADVICE_AGENT_ID = 'savings-advice-agent';

export function savingsAdviceAgentCardUrl(baseUrl: string): string {
  const base = baseUrl.replace(/\/+$/u, '');
  return `${base}/api/.well-known/${SAVINGS_ADVICE_AGENT_ID}/agent-card.json`;
}

export const savingsAdviceA2AAgent = new A2AAgent({
  id: SAVINGS_ADVICE_AGENT_ID,
  name: 'Savings Advice Agent',
  description:
    'Personalized savings and investment advice for one customer. Delegate when they ask what is best for them to save or invest, including the best savings for them. The prompt must include customerId set to their profile id.',
  url: savingsAdviceAgentCardUrl(env.A2A_BASE_URL),
});
