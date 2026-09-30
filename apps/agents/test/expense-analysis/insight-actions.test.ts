import { describe, expect, it } from 'vitest';

import { getInsightAction } from '../../src/mastra/expense-analysis/insight-actions';
import { USE_CASE_LABELS } from '../../src/mastra/schemas/expense-analysis';

describe('getInsightAction', () => {
  it('maps every use-case label to a configured action', () => {
    for (const label of USE_CASE_LABELS) {
      const action = getInsightAction(label);
      expect(action.label.length).toBeGreaterThan(0);
      expect(action.type.length).toBeGreaterThan(0);
    }
  });

  it('returns the expected actions for key labels', () => {
    expect(getInsightAction('costs_could_be_optimized')).toEqual({
      label: 'Review expenses',
      type: 'REVIEW_EXPENSES',
    });
    expect(getInsightAction('spending_anomaly')).toEqual({
      label: 'View transactions',
      type: 'VIEW_TRANSACTIONS',
    });
    expect(getInsightAction('travel_detected')).toEqual({
      label: 'Track trip',
      type: 'TRACK_TRIP',
    });
    expect(getInsightAction('large_lifestyle_change')).toEqual({
      label: 'Set a budget',
      type: 'SET_BUDGET',
    });
    expect(getInsightAction('financial_stress_signals')).toEqual({
      label: 'Review finances',
      type: 'REVIEW_FINANCES',
    });
    expect(getInsightAction('life_event_marriage')).toEqual({
      label: 'Plan shared finances',
      type: 'PLAN_FINANCES',
    });
    expect(getInsightAction('life_event_child')).toEqual({
      label: 'Plan your budget',
      type: 'SET_BUDGET',
    });
    expect(getInsightAction('life_event_job_change')).toEqual({
      label: 'Review your budget',
      type: 'REVIEW_BUDGET',
    });
    expect(getInsightAction('life_event_buying_car')).toEqual({
      label: 'Add to budget',
      type: 'ADD_TO_BUDGET',
    });
    expect(getInsightAction('life_event_buying_home')).toEqual({
      label: 'Calculate home budget',
      type: 'HOME_BUDGET',
    });
    expect(getInsightAction('life_event_retirement')).toEqual({
      label: 'View retirement savings',
      type: 'VIEW_RETIREMENT',
    });
    expect(getInsightAction('unhealthy_lifestyle')).toEqual({
      label: 'Review expenses',
      type: 'REVIEW_EXPENSES',
    });
  });
});
