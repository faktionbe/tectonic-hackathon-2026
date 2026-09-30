import {
  formatProductsForPrompt,
  getProducts,
  type KbcProduct,
} from '@repo/kbc-products';

import type { SavingsAdviceInput } from '../schemas/savings-advice';

import { formatAdviceStrategyGuidance } from './advice-strategies';
import {
  computeSavingsAdviceMetrics,
  type SavingsAdviceMetrics,
} from './metrics';

const CATALOGUE_CATEGORIES = ['saving', 'investing'] as const;

export interface SavingsAdviceContext {
  input: SavingsAdviceInput;
  metrics: SavingsAdviceMetrics;
  catalogue: Array<KbcProduct>;
  catalogueIds: Array<string>;
  selectionPrompt: string;
}

export function getSavingsInvestingCatalogue(): Array<KbcProduct> {
  return getProducts([...CATALOGUE_CATEGORIES]);
}

export function buildSavingsAdviceContext(
  input: SavingsAdviceInput
): SavingsAdviceContext {
  const metrics = computeSavingsAdviceMetrics(input.finances);
  const catalogue = getSavingsInvestingCatalogue();
  const catalogueIds = catalogue.map((product) => product.id);
  const catalogueText = formatProductsForPrompt([...CATALOGUE_CATEGORIES]);

  const selectionPrompt = [
    'Select the most appropriate savings/investment advice strategy for this customer.',
    '',
    'Rules:',
    '- Choose exactly one primaryStrategy from the allowed list.',
    '- Set secondaryStrategy to another allowed strategy, or null if none.',
    '- Only select relevantProductIds from the provided KBC catalogue ids.',
    '- Do not invent products, amounts, or profile facts.',
    '- Consider existing products so you do not recommend redundant products.',
    '- Use the pre-computed financial metrics as factual inputs.',
    '- Prefer insufficient_data when income/expenses or profile signals are too thin.',
    '',
    'Allowed advice strategies:',
    formatAdviceStrategyGuidance(),
    '',
    'Customer profile:',
    JSON.stringify(input.profile, null, 2),
    '',
    'Existing products held:',
    JSON.stringify(input.existingProducts, null, 2),
    '',
    'Deterministic financial metrics (pre-computed; trust these numbers):',
    JSON.stringify(metrics, null, 2),
    '',
    'KBC savings & investment catalogue (only recommend from these):',
    catalogueText,
    '',
    `Catalogue product ids: ${catalogueIds.join(', ')}`,
    '',
    'Return structured output only.',
  ].join('\n');

  return {
    input,
    metrics,
    catalogue,
    catalogueIds,
    selectionPrompt,
  };
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
