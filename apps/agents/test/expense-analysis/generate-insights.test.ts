import { describe, expect, it, vi } from 'vitest';

import {
  buildFallbackInsight,
  generateInsights,
  hasInventedCurrencyAmounts,
  type InsightCopyAgent,
} from '../../src/mastra/expense-analysis/generate-insights';
import type {
  ExpenseAnalysisResult,
  UseCaseResult,
} from '../../src/mastra/schemas/expense-analysis';
import { USE_CASE_LABELS } from '../../src/mastra/schemas/expense-analysis';
import type { LabelFacts } from '../../src/mastra/schemas/financial-insight';

function detectedUseCase(
  overrides: Partial<UseCaseResult> & Pick<UseCaseResult, 'label'>
): UseCaseResult {
  return {
    status: 'detected',
    confidence: 0.91,
    summary:
      "You've spent €187 per month on restaurants recently, compared with €126 before.",
    evidence: [
      {
        transactionIds: ['tx_1', 'tx_2'],
        explanation:
          'Restaurant spending rose from €126/month to €187/month (48% increase).',
      },
    ],
    ...overrides,
  };
}

function notDetected(label: UseCaseResult['label']): UseCaseResult {
  return {
    label,
    status: 'not_detected',
    confidence: 0.7,
    summary: 'No meaningful pattern detected for this use case.',
    evidence: [],
  };
}

function analysisWithDetected(
  detected: Array<UseCaseResult>
): ExpenseAnalysisResult {
  const byLabel = new Map(detected.map((item) => [item.label, item]));

  return {
    period: { start: '2025-10-01', end: '2026-03-31' },
    useCases: USE_CASE_LABELS.map(
      (label) => byLabel.get(label) ?? notDetected(label)
    ),
  };
}

function mockAgent(impl: InsightCopyAgent['generate']): InsightCopyAgent {
  return {
    generate: vi.fn(impl) as InsightCopyAgent['generate'],
  };
}

describe('hasInventedCurrencyAmounts', () => {
  it('allows amounts that appear in evidence', () => {
    expect(
      hasInventedCurrencyAmounts(
        'Spending rose from €126 to €187.',
        'Restaurant spending rose from €126/month to €187/month.'
      )
    ).toBe(false);
  });

  it('rejects invented currency amounts', () => {
    expect(
      hasInventedCurrencyAmounts(
        'You spent €999 on restaurants.',
        'Restaurant spending rose from €126/month to €187/month.'
      )
    ).toBe(true);
  });
});

describe('generateInsights', () => {
  it('uses LLM title/message with mapped action on valid responses', async () => {
    const analysis = analysisWithDetected([
      detectedUseCase({ label: 'large_lifestyle_change' }),
    ]);

    const agent = mockAgent(async () => ({
      object: {
        title: 'Your restaurant spending is up',
        message:
          "You've spent €187 per month on restaurants recently, compared with €126 before.",
      },
    }));

    const result = await generateInsights(analysis, agent);

    expect(result.insights).toHaveLength(1);
    expect(result.insights[0]).toEqual({
      label: 'large_lifestyle_change',
      confidence: 0.91,
      title: 'Your restaurant spending is up',
      message:
        "You've spent €187 per month on restaurants recently, compared with €126 before.",
      detail: {
        label: 'See what changed',
        transactionIds: ['tx_1', 'tx_2'],
      },
      prompt: 'What would you like to do?',
      actions: [
        { label: 'Set a budget', type: 'SET_BUDGET' },
        { label: 'See spending', type: 'SEE_SPENDING' },
      ],
      dismiss: { label: 'Dismiss', type: 'DISMISS' },
    });
    expect(agent.generate).toHaveBeenCalledTimes(1);
  });

  it('falls back when the LLM returns malformed output', async () => {
    const analysis = analysisWithDetected([
      detectedUseCase({ label: 'spending_anomaly' }),
    ]);

    const agent = mockAgent(async () => ({
      object: { title: '' },
    }));

    const result = await generateInsights(analysis, agent);
    const insight = result.insights[0];

    expect(insight).toEqual(
      buildFallbackInsight(detectedUseCase({ label: 'spending_anomaly' }))
    );
  });

  it('falls back when the LLM throws', async () => {
    const analysis = analysisWithDetected([
      detectedUseCase({ label: 'travel_detected' }),
    ]);

    const agent = mockAgent(async () => {
      throw new Error('model unavailable');
    });

    const result = await generateInsights(analysis, agent);

    expect(result.insights[0]).toEqual(
      buildFallbackInsight(detectedUseCase({ label: 'travel_detected' }))
    );
  });

  it('still generates a fallback insight when evidence is empty', async () => {
    const analysis = analysisWithDetected([
      detectedUseCase({
        label: 'financial_stress_signals',
        evidence: [],
        summary: 'Multiple fee-related expenses were observed.',
      }),
    ]);

    const agent = mockAgent(async () => ({
      object: {
        title: 'Fee activity noticed',
        message: 'Multiple fee-related expenses were observed.',
      },
    }));

    const result = await generateInsights(analysis, agent);

    expect(result.insights).toHaveLength(1);
    expect(result.insights[0]?.actions[0]?.type).toBe('REVIEW_FINANCES');
    expect(result.insights[0]?.dismiss).toEqual({
      label: 'Dismiss',
      type: 'DISMISS',
    });
    expect(result.insights[0]?.message.length).toBeGreaterThan(0);
  });

  it('falls back when the LLM invents currency amounts', async () => {
    const analysis = analysisWithDetected([
      detectedUseCase({ label: 'large_lifestyle_change' }),
    ]);

    const agent = mockAgent(async () => ({
      object: {
        title: 'Spending jumped',
        message: 'You suddenly spent €9999 on restaurants.',
      },
    }));

    const result = await generateInsights(analysis, agent);

    expect(result.insights[0]).toEqual(
      buildFallbackInsight(detectedUseCase({ label: 'large_lifestyle_change' }))
    );
    expect(result.insights[0]?.title).not.toMatch(/large lifestyle change/iu);
    expect(result.insights[0]?.title).not.toMatch(/unhealthy lifestyle/iu);
    expect(result.insights[0]?.message).toContain('€187');
    expect(result.insights[0]?.message).toContain('€126');
    expect(result.insights[0]?.message).not.toContain('€9999');
  });

  it('builds a restaurant comparison from lifestyle facts when copy is rejected', async () => {
    const facts: LabelFacts = {
      examples: [],
      lines: [
        'restaurant spending averaged €125 per month earlier and €180 later.',
      ],
      lifestyle: {
        category: 'DINING',
        earlierMonthlyAverage: 125,
        laterMonthlyAverage: 180,
        percentChange: 44,
      },
    };
    const analysis = {
      ...analysisWithDetected([
        detectedUseCase({ label: 'large_lifestyle_change' }),
      ]),
      factsByLabel: { large_lifestyle_change: facts },
    };

    const agent = mockAgent(async () => ({
      object: {
        title: 'Large lifestyle change',
        message: 'You suddenly spent €9999 on restaurants.',
      },
    }));

    const result = await generateInsights(analysis, agent);

    expect(result.insights[0]?.title).toBe('Your restaurant spending is up');
    expect(result.insights[0]?.message).toContain('€180');
    expect(result.insights[0]?.message).toContain('€125');
    expect(result.insights[0]?.title).not.toMatch(/large lifestyle change/iu);
    expect(result.insights[0]?.message).not.toMatch(/unhealthy lifestyle/iu);
    expect(result.insights[0]?.detail.transactionIds).toEqual(['tx_1', 'tx_2']);
  });

  it('keeps sensitive spending copy vague', async () => {
    const analysis = analysisWithDetected([
      detectedUseCase({
        label: 'unhealthy_lifestyle',
        summary: 'More spending in one category.',
        evidence: [
          {
            transactionIds: ['tx_1'],
            explanation: 'Activity in one category increased.',
          },
        ],
      }),
    ]);

    const agent = mockAgent(async () => ({
      object: {
        title: 'Gambling is up',
        message: 'You spent more at a casino.',
      },
    }));

    const result = await generateInsights(analysis, agent);
    const insight = result.insights[0];

    expect(insight?.title).toBe('Spending in this category has changed');
    expect(insight?.message).toBe(
      "You've had more spending in this category recently."
    );
    expect(`${insight?.title} ${insight?.message}`).not.toMatch(
      /casino|gambling|unhealthy lifestyle/iu
    );
    expect(insight?.actions).toEqual([
      { label: 'Spending controls', type: 'SPENDING_CONTROLS' },
      { label: 'Support', type: 'SUPPORT' },
    ]);
  });

  it('only creates insights for detected use cases', async () => {
    const analysis = analysisWithDetected([
      detectedUseCase({ label: 'spending_anomaly' }),
      detectedUseCase({ label: 'travel_detected' }),
    ]);

    const agent = mockAgent(async () => ({
      object: {
        title: 'Insight',
        message: 'Based on the supplied evidence.',
      },
    }));

    const result = await generateInsights(analysis, agent);

    expect(result.insights).toHaveLength(2);
    expect(result.insights.map((item) => item.label).sort()).toEqual([
      'spending_anomaly',
      'travel_detected',
    ]);
    expect(result.useCases).toHaveLength(USE_CASE_LABELS.length);
  });
});
