import type { KbcProduct } from '@repo/kbc-products';

import type { SavingsAdviceInput } from '../schemas/savings-advice';

import type { SavingsAdviceMetrics } from './metrics';

export function buildSelectionPrompt(customerId: string): string {
  return [
    `Select savings and investment advice for customerId ${customerId}.`,
    '',
    'Before choosing a strategy, call these tools:',
    '- fetch_customer_profile with this customerId',
    '- fetch_customer_finances with this customerId',
    '- fetch_kbc_products for the saving and investing categories',
    '',
    'Trust the metrics field on the finances tool result.',
    'Recommend only product ids returned by fetch_kbc_products.',
    'Do not invent profile facts, amounts, or products.',
    'Then return structured output only.',
  ].join('\n');
}

export function buildPersonalizationPrompt(params: {
  input: SavingsAdviceInput;
  metrics: SavingsAdviceMetrics;
  selection: {
    primaryStrategy: string;
    secondaryStrategy: string | null;
    relevantProductIds: Array<string>;
    keyFactors: Array<string>;
    rationale: string;
    confidence: number;
  };
  catalogue: Array<KbcProduct>;
}): string {
  const relevantProducts = params.catalogue.filter((product) =>
    params.selection.relevantProductIds.includes(product.id)
  );

  return [
    'Generate a personalized advice statement for the customer.',
    '',
    'Rules:',
    '- Keep the advice selected by Node 1. Do not change the strategy or invent new products.',
    '- Adapt language complexity to the customer financial literacy level.',
    '- Use the actual financial metrics and profile provided.',
    '- Explain why the advice is relevant to them.',
    '- Communicate clearly and understandably.',
    '- Do not invent numbers; only use supporting metrics and supplied amounts.',
    '',
    `Financial literacy level to adapt to: ${params.input.profile.financialLiteracy}`,
    '',
    'Selected advice (do not change):',
    JSON.stringify(params.selection, null, 2),
    '',
    'Relevant catalogue products (for reference only; do not add others):',
    JSON.stringify(relevantProducts, null, 2),
    '',
    'Customer profile:',
    JSON.stringify(params.input.profile, null, 2),
    '',
    'Existing products held:',
    JSON.stringify(params.input.existingProducts, null, 2),
    '',
    'Supporting financial metrics:',
    JSON.stringify(params.metrics, null, 2),
    '',
    'Return structured output with adviceStatement only.',
  ].join('\n');
}
