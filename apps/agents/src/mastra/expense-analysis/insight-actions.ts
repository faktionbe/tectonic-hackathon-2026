import type { UseCaseLabel } from '../schemas/expense-analysis';
import type { InsightAction } from '../schemas/financial-insight';

const INSIGHT_ACTIONS_BY_LABEL: Record<UseCaseLabel, Array<InsightAction>> = {
  costs_could_be_optimized: [
    { label: 'Review expenses', type: 'REVIEW_EXPENSES' },
  ],
  spending_anomaly: [{ label: 'View transactions', type: 'VIEW_TRANSACTIONS' }],
  travel_detected: [
    { label: 'Track trip', type: 'TRACK_TRIP' },
    { label: 'Set a budget', type: 'SET_BUDGET' },
  ],
  large_lifestyle_change: [
    { label: 'Set a budget', type: 'SET_BUDGET' },
    { label: 'See spending', type: 'SEE_SPENDING' },
  ],
  financial_stress_signals: [
    { label: 'Review finances', type: 'REVIEW_FINANCES' },
  ],
  life_event_marriage: [
    { label: 'Shared finances', type: 'SHARED_FINANCES' },
    { label: 'Savings', type: 'SAVINGS' },
  ],
  life_event_child: [
    { label: 'Baby budget', type: 'BABY_BUDGET' },
    { label: 'Savings goal', type: 'SAVINGS_GOAL' },
  ],
  life_event_job_change: [
    { label: 'Budget', type: 'BUDGET' },
    { label: 'Savings plan', type: 'SAVINGS_PLAN' },
  ],
  life_event_buying_car: [{ label: 'Add to budget', type: 'ADD_TO_BUDGET' }],
  life_event_buying_home: [
    { label: 'Home budget calculator', type: 'HOME_BUDGET' },
  ],
  life_event_retirement: [
    { label: 'Pension overview', type: 'PENSION_OVERVIEW' },
  ],
  unhealthy_lifestyle: [
    { label: 'Spending controls', type: 'SPENDING_CONTROLS' },
    { label: 'Support', type: 'SUPPORT' },
  ],
};

export function getInsightActions(label: UseCaseLabel): Array<InsightAction> {
  return INSIGHT_ACTIONS_BY_LABEL[label];
}
