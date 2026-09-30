import type { UseCaseLabel } from '../schemas/expense-analysis';
import type { InsightAction } from '../schemas/financial-insight';

const INSIGHT_ACTION_BY_LABEL: Record<UseCaseLabel, InsightAction> = {
  costs_could_be_optimized: {
    label: 'Review expenses',
    type: 'REVIEW_EXPENSES',
  },
  spending_anomaly: {
    label: 'View transactions',
    type: 'VIEW_TRANSACTIONS',
  },
  travel_detected: {
    label: 'Track trip',
    type: 'TRACK_TRIP',
  },
  large_lifestyle_change: {
    label: 'Set a budget',
    type: 'SET_BUDGET',
  },
  financial_stress_signals: {
    label: 'Review finances',
    type: 'REVIEW_FINANCES',
  },
  life_event_marriage: {
    label: 'Plan shared finances',
    type: 'PLAN_FINANCES',
  },
  life_event_child: {
    label: 'Plan your budget',
    type: 'SET_BUDGET',
  },
  life_event_job_change: {
    label: 'Review your budget',
    type: 'REVIEW_BUDGET',
  },
  life_event_buying_car: {
    label: 'Add to budget',
    type: 'ADD_TO_BUDGET',
  },
  life_event_buying_home: {
    label: 'Calculate home budget',
    type: 'HOME_BUDGET',
  },
  life_event_retirement: {
    label: 'View retirement savings',
    type: 'VIEW_RETIREMENT',
  },
  unhealthy_lifestyle: {
    label: 'Review expenses',
    type: 'REVIEW_EXPENSES',
  },
};

export function getInsightAction(label: UseCaseLabel): InsightAction {
  return INSIGHT_ACTION_BY_LABEL[label];
}
