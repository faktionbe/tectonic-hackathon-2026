import type { UseCaseLabel } from '../schemas/expense-analysis';

export interface UseCaseDefinition {
  label: UseCaseLabel;
  title: string;
  guidance: string;
}

export const USE_CASE_DEFINITIONS: Array<UseCaseDefinition> = [
  {
    label: 'costs_could_be_optimized',
    title: 'Costs could be optimized',
    guidance:
      'Identify inefficient or overlapping spending such as duplicate subscriptions, repeated fees, similar overlapping services, unexpected fee spikes, or convenience costs. Describe the observable pattern only; do not claim something is objectively too expensive without supporting expense evidence.',
  },
  {
    label: 'spending_anomaly',
    title: 'Spending anomaly',
    guidance:
      "Identify expenses that stand out versus this person's own history (amount, category, or merchant). Prefer comparison to their typical DEBIT amounts rather than generic notions of expensive.",
  },
  {
    label: 'travel_detected',
    title: 'Travel detected',
    guidance:
      'Identify travel using geographic evidence: countryCode/city abroad, hotel/transport abroad, or a short-period foreign cluster. Do not infer travel from merchant names alone without geo evidence. If geo data is missing, prefer insufficient_data.',
  },
  {
    label: 'large_lifestyle_change',
    title: 'Large lifestyle change',
    guidance:
      'Identify meaningful category spending shifts across time (e.g. DINING rising from ~€150/month to ~€700/month). Ignore small month-to-month noise. If the period is too short for comparison, prefer insufficient_data.',
  },
  {
    label: 'financial_stress_signals',
    title: 'Financial stress signals',
    guidance:
      'Identify observable pressure signals: overdraft/NSF/late-payment fees (type FEE or category FEES), rising debt/BNPL payments, repeated negative-balance charges. Describe observed behavior only; never diagnose financial struggle.',
  },
  {
    label: 'life_event_marriage',
    title: 'Life event: marriage',
    guidance:
      'Signal possible marriage-related spending (wedding venues/vendors, coordinated wedding purchases, household recurring shifts). Phrase as a possible signal, not a fact that marriage occurred.',
  },
  {
    label: 'life_event_child',
    title: 'Life event: child',
    guidance:
      'Signal possible child-related spending (baby purchases, childcare, maternity/hospital, baby furniture, new recurring child expenses). Treat as a signal, not proof.',
  },
  {
    label: 'life_event_job_change',
    title: 'Life event: job change',
    guidance:
      'Signal a possible job change: salary CREDITS from one employer party stop and another begins, salary amount changes, commuting patterns change. Lower confidence when income/CREDIT data is thin.',
  },
  {
    label: 'life_event_buying_car',
    title: 'Life event: buying a car',
    guidance:
      'Signal a possible car purchase from a cluster (dealership payment + financing/insurance/registration). A single large payment alone is not enough.',
  },
  {
    label: 'life_event_buying_home',
    title: 'Life event: buying a home',
    guidance:
      'Signal a possible home purchase (property/notary/agency payment, mortgage start, home insurance start). Do not treat normal rent as buying a home.',
  },
  {
    label: 'life_event_retirement',
    title: 'Life event: retirement',
    guidance:
      'Signal possible retirement when multiple patterns align: salary CREDITS stop, pension-like CREDITS begin, work/commute expenses disappear. Prefer multiple supporting signals.',
  },
  {
    label: 'unhealthy_lifestyle',
    title: 'Unhealthy lifestyle',
    guidance:
      'Identify spending patterns associated with gambling, adult/pornography merchants, or other clearly harmful discretionary activities when party name, description, MCC, or subcategory evidence supports it. Treat as a pattern signal, not a moral judgment. Prefer insufficient_data when text is ambiguous.',
  },
];

export function formatUseCaseGuidance(): string {
  return USE_CASE_DEFINITIONS.map(
    (definition) =>
      `- ${definition.label} (${definition.title}): ${definition.guidance}`
  ).join('\n');
}

export function getUseCaseTitle(label: UseCaseLabel): string {
  const definition = USE_CASE_DEFINITIONS.find((item) => item.label === label);
  return definition?.title ?? label;
}
