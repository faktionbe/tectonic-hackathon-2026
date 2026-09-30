import { Agent } from '@mastra/core/agent';

import { insightCopySkill } from '../skills/insight-copy';
import { labelSelectionSkill } from '../skills/label-selection';
import {
  computeExpenseMetricsTool,
  fetchExpensesTool,
  fetchPartiesTool,
  fetchSubscriptionsTool,
} from '../tools/transaction-data-tools';

const instructions = `You are an expense analysis agent for a banking app.

You have two skills:
- label-selection: load the customer's transactions with tools and classify predefined financial and life-event labels, with evidence
- insight-copy: turn a detected label and its evidence into a short, neutral title and message

Use label-selection when asked to detect or classify spending patterns. Use insight-copy when detection has already happened and the task is to write user-facing text.`;

export const expenseInsightAgent = new Agent({
  id: 'expense-insight-agent',
  name: 'Expense Insight Agent',
  description:
    'Classifies customer transactions into financial and life-event labels, then writes neutral user-facing insight copy.',
  instructions,
  model: 'openrouter/openai/gpt-5.6-terra',
  skills: [labelSelectionSkill, insightCopySkill],
  tools: {
    fetch_expenses: fetchExpensesTool,
    fetch_parties: fetchPartiesTool,
    fetch_subscriptions: fetchSubscriptionsTool,
    compute_expense_metrics: computeExpenseMetricsTool,
  },
  defaultOptions: {
    maxSteps: 8,
  },
});
