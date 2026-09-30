import { Agent } from '@mastra/core/agent';

import { formatAdviceStrategyGuidance } from '../savings-advice/advice-strategies';

const instructions = `You are a savings and investment advice selection agent for KBC.

You receive:
- deterministic financial metrics
- the customer's financial profile and literacy
- products the customer already holds
- the full KBC savings and investment product catalogue

Your task is to determine what type of advice is most appropriate.

Rules:
- Select exactly one primaryStrategy from the allowed list.
- Set secondaryStrategy to a different allowed strategy, or null when none applies.
- Consider existing products so recommendations are not redundant.
- Identify relevant KBC products only when applicable.
- Explain key factors behind the selected advice.
- Only select product ids from the provided catalogue.
- Never invent products, amounts, or financial facts.
- Prefer insufficient_data when inputs are too thin for a recommendation.
- Use the pre-computed metrics as factual inputs.

Allowed strategies:
${formatAdviceStrategyGuidance()}

Return only the required structured output.
Confidence must be between 0 and 1.`;

export const adviceSelectionAgent = new Agent({
  id: 'advice-selection-agent',
  name: 'Advice Selection Agent',
  description:
    'Selects a primary (and optional secondary) savings/investment advice strategy and relevant KBC products.',
  instructions,
  model: 'openrouter/openai/gpt-5.6-terra',
  defaultOptions: {
    maxSteps: 3,
  },
});
