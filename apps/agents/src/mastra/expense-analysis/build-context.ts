import type { ExpenseAnalysisInput } from '../schemas/expense-analysis';

import {
  computeExpenseMetrics,
  type ExpenseMetrics,
  type JoinedExpense,
  joinExpenses,
} from './metrics';
import { formatUseCaseGuidance } from './use-cases';

export interface AnalysisContext {
  input: ExpenseAnalysisInput;
  joinedExpenses: Array<JoinedExpense>;
  metrics: ExpenseMetrics;
  prompt: string;
}

export function buildAnalysisContext(
  input: ExpenseAnalysisInput
): AnalysisContext {
  const joinedExpenses = joinExpenses(input.expenses, input.parties ?? []);
  const metrics = computeExpenseMetrics({
    expenses: input.expenses,
    parties: input.parties,
    subscriptions: input.subscriptions,
    period: input.period,
    homeCountryCode: input.homeCountryCode,
  });

  const prompt = [
    'Analyze the following expense dataset and return structured use-case classifications.',
    '',
    `Home country code (if provided): ${input.homeCountryCode ?? 'not provided'}`,
    '',
    'Use-case definitions:',
    formatUseCaseGuidance(),
    '',
    'Deterministic metrics (pre-computed; trust these numbers):',
    JSON.stringify(metrics, null, 2),
    '',
    'Joined expenses (with resolved counterparty fields when available):',
    JSON.stringify(joinedExpenses, null, 2),
    '',
    'Subscriptions (if any):',
    JSON.stringify(input.subscriptions ?? [], null, 2),
    '',
    'Return one result for every use-case label. Cite expense ids in evidence.transactionIds.',
  ].join('\n');

  return {
    input,
    joinedExpenses,
    metrics,
    prompt,
  };
}
