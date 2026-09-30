import type { UseCaseLabel } from '../schemas/expense-analysis';

export interface UseCaseDefinition {
  label: UseCaseLabel;
  title: string;
  guidance: string;
}

export const USE_CASE_DEFINITIONS: Array<UseCaseDefinition> = [
  {
    label: 'costs_could_be_optimized',
    title: 'You could save on recurring expenses',
    guidance:
      'Identify inefficient or overlapping spending such as duplicate subscriptions, repeated fees, similar overlapping services, unexpected fee spikes, or convenience costs. Describe the observable pattern only; do not claim something is objectively too expensive without supporting expense evidence.',
  },
  {
    label: 'spending_anomaly',
    title: 'A recent purchase stands out',
    guidance:
      "Identify expenses that stand out versus this person's own history (amount, category, or merchant). Prefer comparison to their typical DEBIT amounts rather than generic notions of expensive.",
  },
  {
    label: 'travel_detected',
    title: "Looks like you're travelling",
    guidance:
      'Identify travel using geographic evidence: countryCode/city abroad, hotel/transport abroad, or a short-period foreign cluster. Do not infer travel from merchant names alone without geo evidence. If geo data is missing, prefer insufficient_data.',
  },
  {
    label: 'large_lifestyle_change',
    title: 'Your spending pattern has changed',
    guidance:
      'Identify meaningful category spending shifts across time (e.g. DINING rising from ~€150/month to ~€700/month). Ignore small month-to-month noise. If the period is too short for comparison, prefer insufficient_data.',
  },
  {
    label: 'financial_stress_signals',
    title: 'Recent account charges stand out',
    guidance:
      'Identify observable pressure signals: overdraft/NSF/late-payment fees (type FEE or category FEES), rising debt/BNPL payments, repeated negative-balance charges. Describe observed behavior only; never diagnose financial struggle.',
  },
  {
    label: 'life_event_marriage',
    title: 'Planning a life together?',
    guidance:
      'Signal possible marriage-related spending (wedding venues/vendors, coordinated wedding purchases, household recurring shifts). Phrase as a possible signal, not a fact that marriage occurred.',
  },
  {
    label: 'life_event_child',
    title: 'A new chapter may be starting.',
    guidance:
      'Signal possible child-related spending (baby purchases, childcare, maternity/hospital, baby furniture, new recurring child expenses). Treat as a signal, not proof.',
  },
  {
    label: 'life_event_job_change',
    title: 'Your income has changed',
    guidance:
      'Signal a possible job change: salary CREDITS from one employer party stop and another begins, salary amount changes, commuting patterns change. Lower confidence when income/CREDIT data is thin.',
  },
  {
    label: 'life_event_buying_car',
    title: 'Your car could add to your monthly expenses',
    guidance:
      'Signal a possible car purchase from a cluster (dealership payment + financing/insurance/registration). A single large payment alone is not enough.',
  },
  {
    label: 'life_event_buying_home',
    title: 'Want to see what home budget could fit your finances?',
    guidance:
      'Signal a possible home purchase (property/notary/agency payment, mortgage start, home insurance start). Do not treat normal rent as buying a home.',
  },
  {
    label: 'life_event_retirement',
    title: "Want to see how you're doing for retirement?",
    guidance:
      'Signal possible retirement when multiple patterns align: salary CREDITS stop, pension-like CREDITS begin, work/commute expenses disappear. Prefer multiple supporting signals.',
  },
  {
    label: 'unhealthy_lifestyle',
    title: "You've had more spending in this category recently.",
    guidance:
      'Identify a rise in sensitive discretionary spending, such as gambling or adult merchants, when party name, description, MCC, or subcategory evidence supports it. In the summary and every evidence explanation, stay vague: do not name the merchant, the category, or the activity. Describe it only as spending in one category. Prefer insufficient_data when the text is ambiguous.',
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
