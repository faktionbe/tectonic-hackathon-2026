import { describe, expect, it } from 'vitest';

import { getInsightActions } from '../../src/mastra/expense-analysis/insight-actions';
import { USE_CASE_LABELS } from '../../src/mastra/schemas/expense-analysis';

describe('getInsightActions', () => {
  it('maps every use-case label to at least one action', () => {
    for (const label of USE_CASE_LABELS) {
      const actions = getInsightActions(label);
      expect(actions.length).toBeGreaterThan(0);
      for (const action of actions) {
        expect(action.label.length).toBeGreaterThan(0);
        expect(action.type.length).toBeGreaterThan(0);
      }
    }
  });

  it('returns the product actions for each label', () => {
    expect(getInsightActions('costs_could_be_optimized')).toEqual([
      { label: 'Review expenses', type: 'REVIEW_EXPENSES' },
    ]);
    expect(getInsightActions('spending_anomaly')).toEqual([
      { label: 'View transactions', type: 'VIEW_TRANSACTIONS' },
    ]);
    expect(getInsightActions('travel_detected')).toEqual([
      { label: 'Track trip', type: 'TRACK_TRIP' },
      { label: 'Set a budget', type: 'SET_BUDGET' },
    ]);
    expect(getInsightActions('large_lifestyle_change')).toEqual([
      { label: 'Set a budget', type: 'SET_BUDGET' },
      { label: 'See spending', type: 'SEE_SPENDING' },
    ]);
    expect(getInsightActions('financial_stress_signals')).toEqual([
      { label: 'Review finances', type: 'REVIEW_FINANCES' },
    ]);
    expect(getInsightActions('life_event_marriage')).toEqual([
      { label: 'Shared finances', type: 'SHARED_FINANCES' },
      { label: 'Savings', type: 'SAVINGS' },
    ]);
    expect(getInsightActions('life_event_child')).toEqual([
      { label: 'Baby budget', type: 'BABY_BUDGET' },
      { label: 'Savings goal', type: 'SAVINGS_GOAL' },
    ]);
    expect(getInsightActions('life_event_job_change')).toEqual([
      { label: 'Budget', type: 'BUDGET' },
      { label: 'Savings plan', type: 'SAVINGS_PLAN' },
    ]);
    expect(getInsightActions('life_event_buying_car')).toEqual([
      { label: 'Add to budget', type: 'ADD_TO_BUDGET' },
    ]);
    expect(getInsightActions('life_event_buying_home')).toEqual([
      { label: 'Home budget calculator', type: 'HOME_BUDGET' },
    ]);
    expect(getInsightActions('life_event_retirement')).toEqual([
      { label: 'Pension overview', type: 'PENSION_OVERVIEW' },
    ]);
    expect(getInsightActions('unhealthy_lifestyle')).toEqual([
      { label: 'Spending controls', type: 'SPENDING_CONTROLS' },
      { label: 'Support', type: 'SUPPORT' },
    ]);
  });
});
