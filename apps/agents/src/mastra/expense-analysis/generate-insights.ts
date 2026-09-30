import type { UseCaseResult } from '../schemas/expense-analysis';
import {
  type ExpenseAnalysisWithInsights,
  type FinancialInsight,
  INSIGHT_PROMPT,
  type InsightCopy,
  insightCopySchema,
  type LabelFacts,
} from '../schemas/financial-insight';
import { insightCopySkill } from '../skills/insight-copy';

import { getInsightActions } from './insight-actions';
import { buildFallbackCopy, factsAllowText } from './insight-facts';

const INSIGHT_COPY_MAX_STEPS = 1;

const INTERNAL_LABEL_COPY =
  /large lifestyle change|unhealthy lifestyle|spending anomaly|financial stress signals/iu;

const SENSITIVE_DETAIL =
  /casino|gambling|betting|bet365|poker|slot|adult|porn|pornography/iu;

export interface InsightCopyAgent {
  generate: (
    prompt: string,
    options: {
      instructions?: string;
      activeTools?: Array<string | number>;
      maxSteps?: number;
      structuredOutput: {
        schema: typeof insightCopySchema;
      };
    }
  ) => Promise<{ object: unknown }>;
}

export interface InsightGenerationInput {
  period: ExpenseAnalysisWithInsights['period'];
  useCases: Array<UseCaseResult>;
  factsByLabel?: Partial<Record<UseCaseResult['label'], LabelFacts>>;
}

const AMOUNT_PATTERN =
  /(?:€|EUR|\$|£)\s?\d[\d.,]*|\d[\d.,]*\s?(?:€|EUR|\$|£)/giu;

function amountPattern(): RegExp {
  return new RegExp(AMOUNT_PATTERN.source, 'giu');
}

function parseAmountToken(token: string): number | undefined {
  const numeric = token.replace(/[^\d.,]/gu, '');
  if (numeric.length === 0) {
    return undefined;
  }

  const lastComma = numeric.lastIndexOf(',');
  const lastDot = numeric.lastIndexOf('.');
  let normalized = numeric;

  if (lastComma !== -1 && lastDot !== -1) {
    normalized =
      lastComma > lastDot
        ? numeric.replaceAll('.', '').replace(',', '.')
        : numeric.replaceAll(',', '');
  } else if (lastComma !== -1 && /,\d{1,2}$/u.test(numeric)) {
    normalized = numeric.replace(',', '.');
  } else if (lastDot !== -1 && !/\.\d{1,2}$/u.test(numeric)) {
    normalized = numeric.replaceAll('.', '');
  } else if (lastComma !== -1) {
    normalized = numeric.replaceAll(',', '');
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

function extractAmountValues(text: string): Array<number> {
  return [...text.matchAll(amountPattern())].flatMap((match) => {
    const value = parseAmountToken(match[0]);
    return value === undefined ? [] : [value];
  });
}

/**
 * Reject copy that cites a currency amount missing from the allowed source text.
 * Non-currency wording is allowed through.
 */
export function hasInventedCurrencyAmounts(
  copyText: string,
  allowedSourceText: string
): boolean {
  const copyAmounts = extractAmountValues(copyText);
  if (copyAmounts.length === 0) {
    return false;
  }

  const allowed = extractAmountValues(allowedSourceText);
  return copyAmounts.some(
    (amount) =>
      !allowed.some((candidate) => Math.abs(candidate - amount) < 0.001)
  );
}

function detailTransactionIds(useCase: UseCaseResult): Array<string> {
  const seen = new Set<string>();
  const ids: Array<string> = [];

  for (const item of useCase.evidence) {
    for (const id of item.transactionIds) {
      if (seen.has(id)) {
        continue;
      }
      seen.add(id);
      ids.push(id);
    }
  }

  return ids;
}

function withCard(useCase: UseCaseResult, copy: InsightCopy): FinancialInsight {
  return {
    label: useCase.label,
    confidence: useCase.confidence,
    title: copy.title,
    message: copy.message,
    detail: {
      label: 'See what changed',
      transactionIds: detailTransactionIds(useCase),
    },
    prompt: INSIGHT_PROMPT,
    actions: getInsightActions(useCase.label),
    dismiss: {
      label: 'Dismiss',
      type: 'DISMISS',
    },
  };
}

export function buildFallbackInsight(
  useCase: UseCaseResult,
  facts?: LabelFacts
): FinancialInsight {
  return withCard(useCase, buildFallbackCopy(useCase, facts));
}

function revealsSensitiveDetail(text: string, facts?: LabelFacts): boolean {
  if (SENSITIVE_DETAIL.test(text)) {
    return true;
  }

  const names =
    facts?.examples.flatMap((example) =>
      example.counterparty ? [example.counterparty] : []
    ) ?? [];

  const normalized = text.toLowerCase();
  return names.some(
    (name) => name.length > 0 && normalized.includes(name.toLowerCase())
  );
}

function buildCopyPrompt(useCase: UseCaseResult, facts?: LabelFacts): string {
  if (useCase.label === 'unhealthy_lifestyle') {
    return [
      'Write a user-facing insight for sensitive spending.',
      'Do not name a merchant, category, place, or activity.',
      'Use a vague line such as: "You\'ve had more spending in this category recently."',
      'Return only title and message. Do not invent numbers.',
    ].join('\n');
  }

  const lines = facts?.lines ?? [];
  const examples = (facts?.examples ?? []).map((example) => ({
    bookingDate: example.bookingDate,
    amount: example.amount,
    currency: example.currency,
    category: example.category,
    counterparty: example.counterparty,
    countryCode: example.countryCode,
  }));

  return [
    'Write a user-facing insight for this detected financial pattern.',
    '',
    `Label: ${useCase.label}`,
    `Summary: ${useCase.summary}`,
    'Evidence:',
    ...useCase.evidence.map((item) => `- ${item.explanation}`),
    '',
    'Facts you may cite:',
    ...(lines.length > 0 ? lines : ['None beyond the evidence above.']),
    'Example transactions:',
    JSON.stringify(examples, null, 2),
    '',
    'Return only title and message.',
    'Use only currency amounts that appear in the facts, summary, or evidence.',
    'The title must name the concrete category, place, or change.',
    'Never use these titles: Large lifestyle change, Unhealthy lifestyle, Spending anomaly, Financial stress signals.',
  ].join('\n');
}

async function generateOneInsight(
  useCase: UseCaseResult,
  facts: LabelFacts | undefined,
  agent: InsightCopyAgent
): Promise<FinancialInsight> {
  const fallback = buildFallbackInsight(useCase, facts);

  try {
    const response = await agent.generate(buildCopyPrompt(useCase, facts), {
      instructions: insightCopySkill.instructions,
      activeTools: [],
      maxSteps: INSIGHT_COPY_MAX_STEPS,
      structuredOutput: {
        schema: insightCopySchema,
      },
    });

    const parsed = insightCopySchema.safeParse(response.object);
    if (!parsed.success) {
      return fallback;
    }

    const combined = `${parsed.data.title} ${parsed.data.message}`;
    if (INTERNAL_LABEL_COPY.test(combined)) {
      return fallback;
    }

    if (
      useCase.label === 'unhealthy_lifestyle' &&
      revealsSensitiveDetail(combined, facts)
    ) {
      return fallback;
    }

    if (hasInventedCurrencyAmounts(combined, factsAllowText(useCase, facts))) {
      return fallback;
    }

    return withCard(useCase, parsed.data);
  } catch {
    return fallback;
  }
}

export async function generateInsights(
  analysis: InsightGenerationInput,
  agent: InsightCopyAgent
): Promise<ExpenseAnalysisWithInsights> {
  const detected = analysis.useCases.filter(
    (useCase) => useCase.status === 'detected'
  );

  const settled = await Promise.allSettled(
    detected.map(async (useCase) =>
      generateOneInsight(useCase, analysis.factsByLabel?.[useCase.label], agent)
    )
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

    return buildFallbackInsight(
      useCase,
      analysis.factsByLabel?.[useCase.label]
    );
  });

  return {
    period: analysis.period,
    useCases: analysis.useCases,
    insights,
  };
}
