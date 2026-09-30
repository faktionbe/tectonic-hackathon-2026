import type {
  ExpenseAnalysisResult,
  UseCaseResult,
} from '../schemas/expense-analysis';
import {
  type ExpenseAnalysisWithInsights,
  type FinancialInsight,
  insightCopySchema,
} from '../schemas/financial-insight';

import { getInsightAction } from './insight-actions';
import { getUseCaseTitle } from './use-cases';

export interface InsightCopyAgent {
  generate: (
    prompt: string,
    options: {
      structuredOutput: {
        schema: typeof insightCopySchema;
      };
    }
  ) => Promise<{ object: unknown }>;
}

const AMOUNT_PATTERN =
  /(?:€|EUR|\$|£)\s?\d[\d.,]*|\d[\d.,]*\s?(?:€|EUR|\$|£)/giu;

function extractAmounts(text: string): Array<string> {
  const matches = text.match(AMOUNT_PATTERN) ?? [];
  return matches.map((match) => match.replaceAll(/\s+/gu, '').toLowerCase());
}

function normalizeAmountToken(token: string): string {
  return token.replaceAll(/[^\d]/gu, '');
}

/**
 * Reject copy that invents currency amounts not present in the supplied evidence text.
 * Non-currency wording is allowed through.
 */
export function hasInventedCurrencyAmounts(
  copyText: string,
  evidenceText: string
): boolean {
  const copyAmounts = extractAmounts(copyText).map(normalizeAmountToken);
  if (copyAmounts.length === 0) {
    return false;
  }

  const allowed = new Set(
    extractAmounts(evidenceText).map(normalizeAmountToken)
  );

  return copyAmounts.some(
    (amount) => amount.length > 0 && !allowed.has(amount)
  );
}

export function buildFallbackInsight(useCase: UseCaseResult): FinancialInsight {
  return {
    label: useCase.label,
    confidence: useCase.confidence,
    title: getUseCaseTitle(useCase.label),
    message: useCase.summary,
    action: getInsightAction(useCase.label),
  };
}

function buildCopyPrompt(useCase: UseCaseResult): string {
  return [
    'Write a user-facing insight for this detected financial pattern.',
    '',
    `Label: ${useCase.label}`,
    `Confidence: ${useCase.confidence}`,
    `Summary: ${useCase.summary}`,
    'Evidence:',
    JSON.stringify(useCase.evidence, null, 2),
    '',
    'Return only title and message. Do not invent numbers or facts.',
  ].join('\n');
}

function evidenceSourceText(useCase: UseCaseResult): string {
  const evidenceExplanations = useCase.evidence
    .map((item) => item.explanation)
    .join(' ');
  return `${useCase.summary} ${evidenceExplanations}`;
}

async function generateOneInsight(
  useCase: UseCaseResult,
  agent: InsightCopyAgent
): Promise<FinancialInsight> {
  const fallback = buildFallbackInsight(useCase);

  try {
    const response = await agent.generate(buildCopyPrompt(useCase), {
      structuredOutput: {
        schema: insightCopySchema,
      },
    });

    const parsed = insightCopySchema.safeParse(response.object);
    if (!parsed.success) {
      return fallback;
    }

    const evidenceText = evidenceSourceText(useCase);
    const combined = `${parsed.data.title} ${parsed.data.message}`;
    if (hasInventedCurrencyAmounts(combined, evidenceText)) {
      return fallback;
    }

    return {
      label: useCase.label,
      confidence: useCase.confidence,
      title: parsed.data.title,
      message: parsed.data.message,
      action: getInsightAction(useCase.label),
    };
  } catch {
    return fallback;
  }
}

export async function generateInsights(
  analysis: ExpenseAnalysisResult,
  agent: InsightCopyAgent
): Promise<ExpenseAnalysisWithInsights> {
  const detected = analysis.useCases.filter(
    (useCase) => useCase.status === 'detected'
  );

  const settled = await Promise.allSettled(
    detected.map(async (useCase) => generateOneInsight(useCase, agent))
  );

  const insights: Array<FinancialInsight> = settled.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    const useCase = detected[index];
    if (!useCase) {
      throw new Error(
        'Missing detected use case for failed insight generation'
      );
    }

    return buildFallbackInsight(useCase);
  });

  return {
    period: analysis.period,
    useCases: analysis.useCases,
    insights,
  };
}
