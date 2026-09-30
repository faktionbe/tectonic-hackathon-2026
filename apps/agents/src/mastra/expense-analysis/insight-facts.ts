import type { Expense, Party } from '@repo/contracts';

import type { UseCaseResult } from '../schemas/expense-analysis';
import {
  type LabelFacts,
  labelFactsSchema,
  type TransactionExample,
} from '../schemas/financial-insight';

import type { ExpenseMetrics } from './metrics';
import { getUseCaseTitle } from './use-cases';

interface CategoryPhrase {
  spending: string;
  on: string;
}

const CATEGORY_PHRASES: Record<string, CategoryPhrase> = {
  DINING: { spending: 'restaurant spending', on: 'restaurants' },
  GROCERIES: { spending: 'grocery spending', on: 'groceries' },
  SHOPPING: { spending: 'shopping', on: 'shopping' },
  TRANSPORT: { spending: 'transport spending', on: 'transport' },
  ENTERTAINMENT: { spending: 'entertainment spending', on: 'entertainment' },
  TRAVEL: { spending: 'travel spending', on: 'travel' },
  SUBSCRIPTIONS: { spending: 'subscription spending', on: 'subscriptions' },
  HOUSING: { spending: 'housing spending', on: 'housing' },
  UTILITIES: { spending: 'utility spending', on: 'utilities' },
  HEALTH: { spending: 'health spending', on: 'health' },
  INSURANCE: { spending: 'insurance spending', on: 'insurance' },
  EDUCATION: { spending: 'education spending', on: 'education' },
  FEES: { spending: 'fee spending', on: 'fees' },
  TAXES: { spending: 'tax spending', on: 'taxes' },
  OTHER: { spending: 'other spending', on: 'other costs' },
};

const COUNTRY_NAMES: Record<string, string> = {
  AT: 'Austria',
  BE: 'Belgium',
  CH: 'Switzerland',
  DE: 'Germany',
  ES: 'Spain',
  FR: 'France',
  GB: 'the United Kingdom',
  IT: 'Italy',
  LU: 'Luxembourg',
  NL: 'the Netherlands',
  PT: 'Portugal',
  US: 'the United States',
};

export interface InsightFactContext {
  expenses: Array<Expense>;
  parties: Array<Party>;
  metrics: ExpenseMetrics;
}

function categoryPhrase(category: string): CategoryPhrase {
  return (
    CATEGORY_PHRASES[category] ?? {
      spending: `${category.toLowerCase()} spending`,
      on: category.toLowerCase(),
    }
  );
}

function countryName(countryCode: string): string {
  return COUNTRY_NAMES[countryCode] ?? countryCode;
}

export function formatEuro(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  if (Number.isInteger(rounded)) {
    return `€${rounded}`;
  }

  return `€${rounded.toFixed(2)}`;
}

function collectExamples(
  useCase: UseCaseResult,
  expenseById: Map<string, Expense>,
  partyNameById: Map<string, string>
): Array<TransactionExample> {
  const seen = new Set<string>();
  const examples: Array<TransactionExample> = [];

  for (const item of useCase.evidence) {
    for (const transactionId of item.transactionIds) {
      if (seen.has(transactionId)) {
        continue;
      }
      seen.add(transactionId);

      const expense = expenseById.get(transactionId);
      if (!expense) {
        continue;
      }

      const counterparty = expense.counterpartyId
        ? partyNameById.get(expense.counterpartyId)
        : undefined;

      examples.push({
        transactionId,
        amount: expense.amount,
        currency: expense.currency,
        ...(expense.bookingDate ? { bookingDate: expense.bookingDate } : {}),
        ...(expense.category ? { category: expense.category } : {}),
        ...(counterparty ? { counterparty } : {}),
        ...(expense.countryCode ? { countryCode: expense.countryCode } : {}),
        ...(expense.balanceAfter !== undefined
          ? { balanceAfter: expense.balanceAfter }
          : {}),
      });
    }
  }

  return examples;
}

function evidenceIds(useCase: UseCaseResult): Set<string> {
  return new Set(useCase.evidence.flatMap((item) => item.transactionIds));
}

function pickLifestyle(
  metrics: ExpenseMetrics,
  examples: Array<TransactionExample>
): LabelFacts['lifestyle'] {
  const exampleCategories = new Set(
    examples.flatMap((example) => (example.category ? [example.category] : []))
  );
  const preferred = metrics.categoryChanges.filter((change) =>
    exampleCategories.has(change.category)
  );
  const pool = preferred.length > 0 ? preferred : metrics.categoryChanges;
  const ranked = [...pool].sort((left, right) => {
    const leftMagnitude = Math.abs(left.percentChange ?? 0);
    const rightMagnitude = Math.abs(right.percentChange ?? 0);
    return rightMagnitude - leftMagnitude;
  });

  return ranked[0];
}

function pickTravel(
  metrics: ExpenseMetrics,
  ids: Set<string>
): LabelFacts['travel'] {
  const linked = metrics.foreignCountryExpenses.filter((item) =>
    ids.has(item.expenseId)
  );
  const rows = linked.length > 0 ? linked : metrics.foreignCountryExpenses;
  const totals = new Map<string, number>();

  for (const row of rows) {
    totals.set(
      row.countryCode,
      (totals.get(row.countryCode) ?? 0) + row.amount
    );
  }

  let best: { code: string; total: number } | undefined;
  for (const [code, total] of totals) {
    if (!best || total > best.total) {
      best = { code, total };
    }
  }

  if (!best) {
    return undefined;
  }

  return {
    countryName: countryName(best.code),
    total: best.total,
  };
}

function exampleLines(examples: Array<TransactionExample>): Array<string> {
  return examples.slice(0, 5).map((example) => {
    const where = example.counterparty ? ` at ${example.counterparty}` : '';
    const category = example.category ? ` (${example.category})` : '';
    return `${formatEuro(example.amount)}${where}${category}.`;
  });
}

function relatedTotal(examples: Array<TransactionExample>): number | undefined {
  if (examples.length === 0) {
    return undefined;
  }

  return examples.reduce((sum, example) => sum + example.amount, 0);
}

function buildLabelFacts(
  useCase: UseCaseResult,
  examples: Array<TransactionExample>,
  metrics: ExpenseMetrics
): LabelFacts {
  const ids = evidenceIds(useCase);
  const facts: LabelFacts = {
    examples,
    lines: [],
  };

  switch (useCase.label) {
    case 'costs_could_be_optimized': {
      const recurring = metrics.recurringCandidates.filter((candidate) =>
        candidate.expenseIds.some((id) => ids.has(id))
      );
      const chosen =
        recurring.length > 0
          ? recurring
          : metrics.recurringCandidates.slice(0, 3);
      facts.lines.push(
        ...chosen
          .slice(0, 3)
          .map(
            (candidate) =>
              `Recurring charges around ${formatEuro(candidate.averageAmount)} appeared ${candidate.count} times.`
          )
      );
      facts.lines.push(
        ...metrics.subscriptionOverlapSignals.map((signal) => signal.reason)
      );
      break;
    }
    case 'spending_anomaly': {
      const outliers = metrics.largeOutliers.filter((item) =>
        ids.has(item.expenseId)
      );
      const outlier = outliers[0] ?? metrics.largeOutliers[0];
      const match =
        examples.find(
          (example) => example.transactionId === outlier?.expenseId
        ) ?? [...examples].sort((left, right) => right.amount - left.amount)[0];
      if (match) {
        facts.highlight = {
          amount: match.amount,
          ...(match.counterparty ? { counterparty: match.counterparty } : {}),
        };
        const where = match.counterparty ? ` at ${match.counterparty}` : '';
        facts.lines.push(`${formatEuro(match.amount)}${where}.`);
      }
      break;
    }
    case 'travel_detected': {
      const travel = pickTravel(metrics, ids);
      if (travel) {
        facts.travel = travel;
        facts.lines.push(
          `Spending in ${travel.countryName} totals ${formatEuro(travel.total)}.`
        );
      }
      break;
    }
    case 'large_lifestyle_change': {
      const lifestyle = pickLifestyle(metrics, examples);
      if (lifestyle) {
        facts.lifestyle = lifestyle;
        const phrase = categoryPhrase(lifestyle.category);
        facts.lines.push(
          `${phrase.spending} averaged ${formatEuro(lifestyle.earlierMonthlyAverage)} per month earlier and ${formatEuro(lifestyle.laterMonthlyAverage)} later.`
        );
      }
      break;
    }
    case 'financial_stress_signals': {
      const belowZeroCount = examples.filter(
        (example) =>
          example.balanceAfter !== undefined && example.balanceAfter < 0
      ).length;
      if (belowZeroCount > 0) {
        facts.belowZeroCount = belowZeroCount;
        facts.lines.push(`Balance went below €0 ${belowZeroCount} times.`);
      }
      const stressCount = metrics.stressSignals.filter((signal) =>
        ids.has(signal.expenseId)
      ).length;
      if (stressCount > 0) {
        facts.lines.push(
          `Fee or low-balance signals showed up ${stressCount} times.`
        );
      }
      break;
    }
    case 'unhealthy_lifestyle': {
      facts.lines.push(
        'Spending in one category is higher than earlier in this period.'
      );
      break;
    }
    case 'life_event_job_change': {
      facts.lines.push(
        ...metrics.incomeByCounterparty.map(
          (income) =>
            `Income from ${income.key} totals ${formatEuro(income.total)}.`
        )
      );
      break;
    }
    case 'life_event_buying_car':
    case 'life_event_buying_home': {
      const total = relatedTotal(examples);
      if (total !== undefined) {
        facts.relatedTotal = total;
        facts.lines.push(`Related transactions total ${formatEuro(total)}.`);
      }
      break;
    }
    case 'life_event_marriage':
    case 'life_event_child':
    case 'life_event_retirement': {
      facts.lines.push(...exampleLines(examples));
      break;
    }
    default: {
      const exhaustive: never = useCase.label;
      throw new Error(`Unexpected use-case label: ${String(exhaustive)}`);
    }
  }

  return labelFactsSchema.parse(facts);
}

export function attachInsightFacts(
  analysis: {
    period: { start: string; end: string };
    useCases: Array<UseCaseResult>;
  },
  context: InsightFactContext
): {
  period: { start: string; end: string };
  useCases: Array<UseCaseResult>;
  factsByLabel: Partial<Record<UseCaseResult['label'], LabelFacts>>;
} {
  const partyNameById = new Map(
    context.parties.map((party) => [party.id, party.name])
  );
  const expenseById = new Map(
    context.expenses.map((expense) => [expense.id, expense])
  );
  const factsByLabel: Partial<Record<UseCaseResult['label'], LabelFacts>> = {};

  for (const useCase of analysis.useCases) {
    if (useCase.status !== 'detected') {
      continue;
    }

    const examples = collectExamples(useCase, expenseById, partyNameById);
    factsByLabel[useCase.label] = buildLabelFacts(
      useCase,
      examples,
      context.metrics
    );
  }

  return {
    period: analysis.period,
    useCases: analysis.useCases,
    factsByLabel,
  };
}

function evidenceMessage(useCase: UseCaseResult): string {
  const explanations = useCase.evidence
    .map((item) => item.explanation)
    .filter((explanation) => explanation.length > 0);

  if (explanations.length > 0) {
    return explanations.join(' ');
  }

  return useCase.summary;
}

export function buildFallbackCopy(
  useCase: UseCaseResult,
  facts?: LabelFacts
): { title: string; message: string } {
  if (useCase.label === 'unhealthy_lifestyle') {
    return {
      title: 'Spending in this category has changed',
      message: "You've had more spending in this category recently.",
    };
  }

  if (useCase.label === 'large_lifestyle_change' && facts?.lifestyle) {
    const phrase = categoryPhrase(facts.lifestyle.category);
    const direction =
      facts.lifestyle.laterMonthlyAverage >=
      facts.lifestyle.earlierMonthlyAverage
        ? 'up'
        : 'down';

    return {
      title: `Your ${phrase.spending} is ${direction}`,
      message: `You've spent ${formatEuro(facts.lifestyle.laterMonthlyAverage)} on ${phrase.on} recently, compared with ${formatEuro(facts.lifestyle.earlierMonthlyAverage)} on average.`,
    };
  }

  if (useCase.label === 'spending_anomaly' && facts?.highlight) {
    const where = facts.highlight.counterparty
      ? ` at ${facts.highlight.counterparty}`
      : '';

    return {
      title: `You spent ${formatEuro(facts.highlight.amount)}${where}`,
      message: evidenceMessage(useCase),
    };
  }

  if (useCase.label === 'travel_detected' && facts?.travel) {
    return {
      title: "Looks like you're travelling.",
      message: `You've spent ${formatEuro(facts.travel.total)} in ${facts.travel.countryName}.`,
    };
  }

  if (
    useCase.label === 'financial_stress_signals' &&
    facts?.belowZeroCount !== undefined &&
    facts.belowZeroCount > 0
  ) {
    const times = facts.belowZeroCount === 1 ? 'time' : 'times';

    return {
      title: 'Your balance went below €0',
      message: `Your account has gone below €0 ${facts.belowZeroCount} ${times} recently.`,
    };
  }

  if (
    (useCase.label === 'life_event_buying_car' ||
      useCase.label === 'life_event_buying_home') &&
    facts?.relatedTotal !== undefined
  ) {
    return {
      title: getUseCaseTitle(useCase.label),
      message: `Related transactions total ${formatEuro(facts.relatedTotal)}.`,
    };
  }

  return {
    title: getUseCaseTitle(useCase.label),
    message: evidenceMessage(useCase),
  };
}

export function factsAllowText(
  useCase: UseCaseResult,
  facts?: LabelFacts
): string {
  const parts = [
    useCase.summary,
    ...useCase.evidence.map((item) => item.explanation),
  ];

  if (!facts) {
    return parts.join(' ');
  }

  parts.push(...facts.lines);
  for (const example of facts.examples) {
    parts.push(formatEuro(example.amount));
    if (example.balanceAfter !== undefined) {
      parts.push(formatEuro(example.balanceAfter));
    }
  }

  if (facts.lifestyle) {
    parts.push(formatEuro(facts.lifestyle.earlierMonthlyAverage));
    parts.push(formatEuro(facts.lifestyle.laterMonthlyAverage));
  }

  if (facts.travel) {
    parts.push(formatEuro(facts.travel.total));
  }

  if (facts.highlight) {
    parts.push(formatEuro(facts.highlight.amount));
  }

  if (facts.relatedTotal !== undefined) {
    parts.push(formatEuro(facts.relatedTotal));
  }

  return parts.join(' ');
}
