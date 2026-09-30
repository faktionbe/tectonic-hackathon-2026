import { config } from 'dotenv';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { expenseInsightAgent } from '../../src/mastra/agents/expense-insight-agent';
import { generateInsights } from '../../src/mastra/expense-analysis/generate-insights';
import type {
  ExpenseAnalysisResult,
  UseCaseResult,
} from '../../src/mastra/schemas/expense-analysis';
import { USE_CASE_LABELS } from '../../src/mastra/schemas/expense-analysis';

config({ path: resolve(process.cwd(), '.env') });

const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY;

function notDetected(label: UseCaseResult['label']): UseCaseResult {
  return {
    label,
    status: 'not_detected',
    confidence: 0.7,
    summary: 'No meaningful pattern detected for this use case.',
    evidence: [],
  };
}

const lifestyleDetected: UseCaseResult = {
  label: 'large_lifestyle_change',
  status: 'detected',
  confidence: 0.91,
  summary:
    "You've spent €187 per month on restaurants recently, compared with €126 before.",
  evidence: [
    {
      transactionIds: ['tx_ls_1', 'tx_ls_2'],
      explanation:
        'Restaurant spending rose from about €126/month to about €187/month.',
    },
  ],
};

const analysis: ExpenseAnalysisResult = {
  period: { start: '2025-10-01', end: '2026-03-31' },
  useCases: USE_CASE_LABELS.map((label) =>
    label === 'large_lifestyle_change' ? lifestyleDetected : notDetected(label)
  ),
};

describe.skipIf(!hasOpenRouterKey)('generateInsights live LLM', () => {
  it('returns an insight with mapped action for a detected use case', async () => {
    const result = await generateInsights(analysis, expenseInsightAgent);
    const insight = result.insights.find(
      (item) => item.label === 'large_lifestyle_change'
    );

    expect(insight).toBeDefined();
    expect(insight?.title.length).toBeGreaterThan(0);
    expect(insight?.message.length).toBeGreaterThan(0);
    expect(insight?.title).toMatch(/restaurant|dining|spending/iu);
    expect(insight?.title).not.toMatch(/large lifestyle change/iu);
    expect(insight?.message).not.toMatch(/large lifestyle change/iu);
    expect(`${insight?.title} ${insight?.message}`).not.toMatch(/€999/u);

    const amounts = [
      ...(insight?.title.match(/€\s?\d[\d.,]*/gu) ?? []),
      ...(insight?.message.match(/€\s?\d[\d.,]*/gu) ?? []),
    ].map((token) => Number(token.replace(/[^\d.]/gu, '')));
    for (const amount of amounts) {
      expect([126, 187]).toContain(amount);
    }

    expect(insight?.actions).toEqual([
      { label: 'Set a budget', type: 'SET_BUDGET' },
      { label: 'See spending', type: 'SEE_SPENDING' },
    ]);
    expect(insight?.detail).toEqual({
      label: 'See what changed',
      transactionIds: ['tx_ls_1', 'tx_ls_2'],
    });
    expect(insight?.dismiss).toEqual({ label: 'Dismiss', type: 'DISMISS' });
  });
});
