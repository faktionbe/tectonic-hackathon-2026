import type { Expense, Party, Subscription } from '@repo/contracts';

export interface JoinedExpense extends Expense {
  counterpartyName?: string;
  counterpartyCountryCode?: string;
  resolvedCountryCode?: string;
}

export interface AggregateBucket {
  key: string;
  total: number;
  count: number;
}

export interface MonthlyCategoryTotal {
  month: string;
  category: string;
  total: number;
}

export interface CategoryChange {
  category: string;
  earlierMonthlyAverage: number;
  laterMonthlyAverage: number;
  percentChange: number | null;
}

export interface RecurringCandidate {
  key: string;
  count: number;
  averageAmount: number;
  expenseIds: Array<string>;
}

export interface SignalHit {
  expenseId: string;
  reasons: Array<string>;
}

export interface ExpenseMetrics {
  period: {
    start: string;
    end: string;
  };
  expenseCount: number;
  debitCount: number;
  creditCount: number;
  debitTotal: number;
  creditTotal: number;
  debitAverage: number | null;
  debitMedian: number | null;
  debitStdDev: number | null;
  monthsCovered: number;
  monthlyTotals: Array<AggregateBucket>;
  categoryTotals: Array<AggregateBucket>;
  counterpartyTotals: Array<AggregateBucket>;
  monthlyCategoryTotals: Array<MonthlyCategoryTotal>;
  categoryChanges: Array<CategoryChange>;
  recurringCandidates: Array<RecurringCandidate>;
  foreignCountryExpenses: Array<{
    expenseId: string;
    countryCode: string;
    amount: number;
    bookingDate: string;
  }>;
  largeOutliers: Array<{
    expenseId: string;
    amount: number;
    zScore: number | null;
    medianMultiple: number | null;
  }>;
  stressSignals: Array<SignalHit>;
  unhealthyLifestyleSignals: Array<SignalHit>;
  incomeByCounterparty: Array<AggregateBucket>;
  subscriptionOverlapSignals: Array<{
    subscriptionIds: Array<string>;
    reason: string;
  }>;
  dataSufficiency: {
    monthsCovered: number;
    hasGeoData: boolean;
    hasCategoryData: boolean;
    hasPartyData: boolean;
    hasMultiMonthHistory: boolean;
  };
}

export interface ComputeMetricsInput {
  expenses: Array<Expense>;
  parties?: Array<Party>;
  subscriptions?: Array<Subscription>;
  period?: {
    start: string;
    end: string;
  };
  homeCountryCode?: string;
}

const STRESS_KEYWORDS = [
  'overdraft',
  'nsf',
  'insufficient funds',
  'late fee',
  'late payment',
  'bnpl',
  'afterpay',
  'klarna',
  'negative balance',
  'returned payment',
];

const UNHEALTHY_KEYWORDS = [
  'casino',
  'gambling',
  'betting',
  'bet365',
  'poker',
  'slot',
  'adult',
  'porn',
  'xxx',
];

const UNHEALTHY_MCCS = new Set([
  '7995', // betting
  '7801', // government owned lottery
  '7800', // government lottery
]);

function compareNumbers(left: number, right: number): number {
  return left - right;
}

function compareTotals(left: AggregateBucket, right: AggregateBucket): number {
  return right.total - left.total;
}

function compareCounts(
  left: RecurringCandidate,
  right: RecurringCandidate
): number {
  return right.count - left.count;
}

function compareAmounts(
  left: { amount: number },
  right: { amount: number }
): number {
  return right.amount - left.amount;
}

function compareMonths(
  left: MonthlyCategoryTotal,
  right: MonthlyCategoryTotal
): number {
  return left.month.localeCompare(right.month);
}

function mean(values: Array<number>): number | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: Array<number>): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort(compareNumbers);
  const mid = Math.floor(sorted.length / 2);
  const lower = sorted.at(mid - 1);
  const upper = sorted.at(mid);

  if (sorted.length % 2 === 0) {
    if (lower === undefined || upper === undefined) {
      return null;
    }
    return (lower + upper) / 2;
  }

  return upper ?? null;
}

function stdDev(values: Array<number>): number | null {
  if (values.length < 2) {
    return null;
  }

  const avg = mean(values);
  if (avg === null) {
    return null;
  }

  const variance =
    values.reduce((sum, value) => sum + (value - avg) ** 2, 0) /
    (values.length - 1);

  return Math.sqrt(variance);
}

function monthKey(date: string): string {
  return date.slice(0, 7);
}

function textBlob(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ').toLowerCase();
}

function matchesAny(haystack: string, needles: Array<string>): Array<string> {
  return needles.filter((needle) => haystack.includes(needle));
}

function toAggregates(
  entries: Array<{ key: string; amount: number }>
): Array<AggregateBucket> {
  const map = new Map<string, AggregateBucket>();

  for (const entry of entries) {
    const existing = map.get(entry.key);
    if (existing) {
      existing.total += entry.amount;
      existing.count += 1;
    } else {
      map.set(entry.key, {
        key: entry.key,
        total: entry.amount,
        count: 1,
      });
    }
  }

  return [...map.values()].sort(compareTotals);
}

export function joinExpenses(
  expenses: Array<Expense>,
  parties: Array<Party> = []
): Array<JoinedExpense> {
  const partyById = new Map(parties.map((party) => [party.id, party]));

  return expenses.map((expense) => {
    const party = expense.counterpartyId
      ? partyById.get(expense.counterpartyId)
      : undefined;
    const resolvedCountryCode =
      expense.countryCode ?? party?.countryCode ?? undefined;

    return {
      ...expense,
      counterpartyName: party?.name,
      counterpartyCountryCode: party?.countryCode,
      resolvedCountryCode,
    };
  });
}

export function computeExpenseMetrics(
  input: ComputeMetricsInput
): ExpenseMetrics {
  const parties = input.parties ?? [];
  const subscriptions = input.subscriptions ?? [];
  const joined = joinExpenses(input.expenses, parties);
  const sortedDates = [...joined.map((expense) => expense.bookingDate)].sort();
  const firstDate = sortedDates.at(0);
  const lastDate = sortedDates.at(-1);

  if (!firstDate || !lastDate) {
    throw new Error('At least one expense bookingDate is required');
  }

  const period = {
    start: input.period?.start ?? firstDate,
    end: input.period?.end ?? lastDate,
  };

  const debits = joined.filter((expense) => expense.direction === 'DEBIT');
  const credits = joined.filter((expense) => expense.direction === 'CREDIT');
  const debitAmounts = debits.map((expense) => expense.amount);
  const debitAverage = mean(debitAmounts);
  const debitMedian = median(debitAmounts);
  const debitStdDev = stdDev(debitAmounts);

  const monthlyTotals = toAggregates(
    debits.map((expense) => ({
      key: monthKey(expense.bookingDate),
      amount: expense.amount,
    }))
  );

  const categoryTotals = toAggregates(
    debits.flatMap((expense) =>
      expense.category
        ? [{ key: expense.category, amount: expense.amount }]
        : []
    )
  );

  const counterpartyTotals = toAggregates(
    debits.map((expense) => ({
      key: expense.counterpartyName ?? expense.counterpartyId ?? 'unknown',
      amount: expense.amount,
    }))
  );

  const monthlyCategoryMap = new Map<string, number>();
  for (const expense of debits) {
    if (!expense.category) {
      continue;
    }
    const key = `${monthKey(expense.bookingDate)}::${expense.category}`;
    monthlyCategoryMap.set(
      key,
      (monthlyCategoryMap.get(key) ?? 0) + expense.amount
    );
  }

  const monthlyCategoryTotals: Array<MonthlyCategoryTotal> = [
    ...monthlyCategoryMap.entries(),
  ]
    .flatMap(([key, total]) => {
      const [month, category] = key.split('::');
      if (!month || !category) {
        return [];
      }
      return [{ month, category, total }];
    })
    .sort(compareMonths);

  const months = [...new Set(monthlyTotals.map((item) => item.key))].sort();
  const monthsCovered = months.length;
  const midpoint = Math.floor(months.length / 2);
  const earlierMonths = new Set(months.slice(0, midpoint));
  const laterMonths = new Set(months.slice(midpoint));

  const categoryChanges: Array<CategoryChange> = [];
  const categories = new Set(
    monthlyCategoryTotals.map((item) => item.category)
  );

  for (const category of categories) {
    const earlierValues = monthlyCategoryTotals
      .filter(
        (item) => item.category === category && earlierMonths.has(item.month)
      )
      .map((item) => item.total);
    const laterValues = monthlyCategoryTotals
      .filter(
        (item) => item.category === category && laterMonths.has(item.month)
      )
      .map((item) => item.total);

    if (earlierValues.length === 0 || laterValues.length === 0) {
      continue;
    }

    const earlierMonthlyAverage = mean(earlierValues) ?? 0;
    const laterMonthlyAverage = mean(laterValues) ?? 0;
    const percentChange =
      earlierMonthlyAverage === 0
        ? null
        : ((laterMonthlyAverage - earlierMonthlyAverage) /
            earlierMonthlyAverage) *
          100;

    categoryChanges.push({
      category,
      earlierMonthlyAverage,
      laterMonthlyAverage,
      percentChange,
    });
  }

  const recurringMap = new Map<
    string,
    { amounts: Array<number>; expenseIds: Array<string> }
  >();

  for (const expense of debits) {
    const key =
      expense.subscriptionId ??
      `${expense.counterpartyId ?? expense.counterpartyName ?? expense.description ?? 'unknown'}::${Math.round(expense.amount)}`;
    const existing = recurringMap.get(key) ?? {
      amounts: [],
      expenseIds: [],
    };
    existing.amounts.push(expense.amount);
    existing.expenseIds.push(expense.id);
    recurringMap.set(key, existing);
  }

  const recurringCandidates: Array<RecurringCandidate> = [
    ...recurringMap.entries(),
  ]
    .filter(([, value]) => value.expenseIds.length >= 2)
    .map(([key, value]) => ({
      key,
      count: value.expenseIds.length,
      averageAmount: mean(value.amounts) ?? 0,
      expenseIds: value.expenseIds,
    }))
    .sort(compareCounts);

  const foreignCountryExpenses = joined.flatMap((expense) => {
    if (!input.homeCountryCode || !expense.resolvedCountryCode) {
      return [];
    }
    if (expense.resolvedCountryCode === input.homeCountryCode) {
      return [];
    }

    return [
      {
        expenseId: expense.id,
        countryCode: expense.resolvedCountryCode,
        amount: expense.amount,
        bookingDate: expense.bookingDate,
      },
    ];
  });

  const largeOutliers = debits
    .map((expense) => {
      let zScore: number | null = null;
      if (debitAverage !== null && debitStdDev !== null && debitStdDev > 0) {
        zScore = (expense.amount - debitAverage) / debitStdDev;
      }

      const medianMultiple =
        debitMedian !== null && debitMedian > 0
          ? expense.amount / debitMedian
          : null;

      return {
        expenseId: expense.id,
        amount: expense.amount,
        zScore,
        medianMultiple,
      };
    })
    .filter((item) => {
      const highZ = item.zScore !== null && item.zScore >= 2;
      const highMedianMultiple =
        item.medianMultiple !== null && item.medianMultiple >= 5;
      return highZ || highMedianMultiple;
    })
    .sort(compareAmounts);

  const stressSignals: Array<SignalHit> = [];
  const unhealthyLifestyleSignals: Array<SignalHit> = [];

  for (const expense of joined) {
    const blob = textBlob([
      expense.description,
      expense.subCategory,
      expense.counterpartyName,
    ]);
    const stressReasons: Array<string> = [];
    const unhealthyReasons: Array<string> = [];

    if (expense.type === 'FEE' || expense.category === 'FEES') {
      stressReasons.push('fee_type_or_category');
    }

    stressReasons.push(
      ...matchesAny(blob, STRESS_KEYWORDS).map(
        (keyword) => `keyword:${keyword}`
      )
    );

    if (expense.mcc && UNHEALTHY_MCCS.has(expense.mcc)) {
      unhealthyReasons.push(`mcc:${expense.mcc}`);
    }

    unhealthyReasons.push(
      ...matchesAny(blob, UNHEALTHY_KEYWORDS).map(
        (keyword) => `keyword:${keyword}`
      )
    );

    if (stressReasons.length > 0) {
      stressSignals.push({ expenseId: expense.id, reasons: stressReasons });
    }

    if (unhealthyReasons.length > 0) {
      unhealthyLifestyleSignals.push({
        expenseId: expense.id,
        reasons: unhealthyReasons,
      });
    }
  }

  const incomeByCounterparty = toAggregates(
    credits.map((expense) => ({
      key: expense.counterpartyName ?? expense.counterpartyId ?? 'unknown',
      amount: expense.amount,
    }))
  );

  const activeSubscriptions = subscriptions.filter(
    (subscriptionItem) => subscriptionItem.status === 'ACTIVE'
  );
  const subscriptionOverlapSignals: Array<{
    subscriptionIds: Array<string>;
    reason: string;
  }> = [];

  for (
    let leftIndex = 0;
    leftIndex < activeSubscriptions.length;
    leftIndex += 1
  ) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < activeSubscriptions.length;
      rightIndex += 1
    ) {
      const left = activeSubscriptions.at(leftIndex);
      const right = activeSubscriptions.at(rightIndex);
      if (!left || !right) {
        continue;
      }

      const similarAmount =
        Math.abs(left.amount - right.amount) /
          Math.max(left.amount, right.amount) <=
        0.15;
      const sameCategory = !!left.category && left.category === right.category;

      if (similarAmount && sameCategory) {
        subscriptionOverlapSignals.push({
          subscriptionIds: [left.id, right.id],
          reason: `Similar active subscriptions in category ${left.category}`,
        });
      }
    }
  }

  const hasGeoData = joined.some((expense) => !!expense.resolvedCountryCode);
  const hasCategoryData = joined.some((expense) => !!expense.category);
  const hasPartyData = joined.some(
    (expense) => !!expense.counterpartyId || !!expense.counterpartyName
  );

  return {
    period,
    expenseCount: joined.length,
    debitCount: debits.length,
    creditCount: credits.length,
    debitTotal: debits.reduce((sum, expense) => sum + expense.amount, 0),
    creditTotal: credits.reduce((sum, expense) => sum + expense.amount, 0),
    debitAverage,
    debitMedian,
    debitStdDev,
    monthsCovered,
    monthlyTotals,
    categoryTotals,
    counterpartyTotals,
    monthlyCategoryTotals,
    categoryChanges,
    recurringCandidates,
    foreignCountryExpenses,
    largeOutliers,
    stressSignals,
    unhealthyLifestyleSignals,
    incomeByCounterparty,
    subscriptionOverlapSignals,
    dataSufficiency: {
      monthsCovered,
      hasGeoData,
      hasCategoryData,
      hasPartyData,
      hasMultiMonthHistory: monthsCovered >= 2,
    },
  };
}
