import { createSkill } from '@mastra/core/skills';

import { formatUseCaseGuidance } from '../expense-analysis/use-cases';

export const labelSelectionSkill = createSkill({
  name: 'label-selection',
  description:
    'Use when classifying customer transactions into predefined financial and life-event labels with evidence.',
  instructions: `You are an expense analysis skill.

You are given a customerId. You must load that customer's transactions yourself before classifying anything.

Call these tools first, with the customerId from the request:
- fetch_expenses
- fetch_parties
- fetch_subscriptions
- compute_expense_metrics

Pass an optional period or homeCountryCode only when the request includes them.

Your task is to identify predefined financial patterns and possible life events from the tool results.

Consider individual expenses as well as patterns across multiple expenses and changes over time.

Only identify a use case when there is meaningful evidence in the tool results.

Never invent expenses, merchants, amounts, dates, countries, or other evidence.

Every detected use case must include traceable evidence referencing expense ids in evidence.transactionIds.

For life-event classifications, treat the result as a financial signal rather than proof that the event occurred.

Do not make assumptions about the person's intentions, personality, health, or financial situation.

Distinguish between detected, not_detected, and insufficient_data.

Use:
- detected when there is meaningful supporting evidence
- not_detected when there is enough relevant data to reasonably conclude the use case is not present
- insufficient_data when the dataset lacks information needed for a meaningful determination (for example missing geo for travel_detected, or too few months for large_lifestyle_change)

When evidence is weak or ambiguous, prefer insufficient_data or not_detected rather than inventing a conclusion.

Use compute_expense_metrics as the factual numbers. Do not recalculate totals yourself. Reason across related expenses together when they strengthen a signal.

Field naming follows the Expense contract: bookingDate, direction (DEBIT/CREDIT), category, type, countryCode, counterparty/party names, subscriptionId, description, mcc.

Use cases to classify:
${formatUseCaseGuidance()}

Return useCases as an object keyed by every label exactly once, not as an array. Each value has status, confidence, summary, and evidence.
Confidence must be between 0 and 1 and reflect how strongly the transaction pattern supports the classification, not a probability that a life event literally happened.`,
});
