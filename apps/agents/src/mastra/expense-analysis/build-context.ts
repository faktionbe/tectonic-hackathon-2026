import type { ExpenseAnalysisRequest } from '../schemas/expense-analysis';

export function buildExpenseAnalysisPrompt(
  input: ExpenseAnalysisRequest
): string {
  const lines = [
    `Analyze expenses for customerId ${input.customerId}.`,
    '',
    'Before classifying, call these tools with that customerId:',
    '- fetch_expenses',
    '- fetch_parties',
    '- fetch_subscriptions',
    '- compute_expense_metrics',
    '',
    'Use only the tool results as facts. Trust compute_expense_metrics numbers.',
    'Do not invent expenses, merchants, amounts, dates, or countries.',
    'Then return useCases as an object keyed by every label, not as an array.',
  ];

  if (input.period) {
    lines.push(
      '',
      `Pass this period to fetch_expenses and compute_expense_metrics: ${JSON.stringify(input.period)}`
    );
  }

  if (input.homeCountryCode) {
    lines.push(
      '',
      `Pass homeCountryCode ${input.homeCountryCode} to compute_expense_metrics.`
    );
  }

  return lines.join('\n');
}
