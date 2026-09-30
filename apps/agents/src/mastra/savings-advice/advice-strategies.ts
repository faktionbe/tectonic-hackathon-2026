import type { AdviceStrategy } from '../schemas/savings-advice';

export interface AdviceStrategyDefinition {
  label: AdviceStrategy;
  title: string;
  guidance: string;
}

export const ADVICE_STRATEGY_DEFINITIONS: Array<AdviceStrategyDefinition> = [
  {
    label: 'build_emergency_buffer',
    title: 'Build emergency buffer',
    guidance:
      'Use when savings-to-expense coverage is thin (roughly under 3 months) or current savings are clearly too low for stability. Prefer accessible savings products before recommending investments. Do not push investing until a basic buffer is addressed.',
  },
  {
    label: 'increase_savings_rate',
    title: 'Increase savings rate',
    guidance:
      'Use when there is a positive monthly surplus but the savings rate is weak relative to goals, or the person is not converting surplus into savings. Focus on savings habits and goal-oriented saving products rather than complex investments.',
  },
  {
    label: 'start_investing',
    title: 'Start investing',
    guidance:
      'Use when the person has a solid emergency buffer, little or no existing investing, suitable risk tolerance and a medium/long horizon. Recommend catalogue investing products that match literacy and risk. Do not use when liquidity needs are high or the buffer is weak.',
  },
  {
    label: 'invest_gradually',
    title: 'Invest gradually',
    guidance:
      'Use when the person is ready to invest but literacy is beginner, risk is low/medium, or they benefit from monthly/plan-based entry rather than a lump sum. Prefer investment plans and low-barrier catalogue products.',
  },
  {
    label: 'optimize_existing_products',
    title: 'Optimize existing products',
    guidance:
      'Use when the person already holds several savings/investment products that may be redundant, poorly matched to goals/risk/horizon, or incomplete. Recommend adjustments using only catalogue products; do not invent products.',
  },
  {
    label: 'pension_planning',
    title: 'Pension planning',
    guidance:
      'Use when age category, goals, or horizon point to retirement/pension needs and there is a clear gap versus pension-related catalogue products. Prefer when existing holdings lack pension products.',
  },
  {
    label: 'rebalance_risk',
    title: 'Rebalance risk',
    guidance:
      'Use when existing holdings appear mismatched to stated risk tolerance or investment horizon (for example high-risk products with low risk tolerance, or long-lock products with short horizon). Explain the mismatch using provided holdings and profile only.',
  },
  {
    label: 'preserve_liquidity',
    title: 'Preserve liquidity',
    guidance:
      'Use when liquidity needs are high or near-term goals require accessible money. Avoid recommending locked or long-horizon products. Prefer accessible savings products from the catalogue.',
  },
  {
    label: 'stay_the_course',
    title: 'Stay the course',
    guidance:
      'Use when the financial situation, buffer, and existing products already fit the profile reasonably well. Reinforce the current approach; relevantProductIds may be empty. Do not invent a need for new products.',
  },
  {
    label: 'insufficient_data',
    title: 'Insufficient data',
    guidance:
      'Use when critical inputs are too thin for a meaningful recommendation (for example missing income/expenses, contradictory thin profile signals, or no usable financial base). Keep relevantProductIds empty and explain what is missing.',
  },
];

export function formatAdviceStrategyGuidance(): string {
  return ADVICE_STRATEGY_DEFINITIONS.map(
    (strategy) =>
      `- ${strategy.label} (${strategy.title}): ${strategy.guidance}`
  ).join('\n');
}

export function getAdviceStrategyTitle(label: AdviceStrategy): string {
  const match = ADVICE_STRATEGY_DEFINITIONS.find(
    (strategy) => strategy.label === label
  );
  return match?.title ?? label;
}
