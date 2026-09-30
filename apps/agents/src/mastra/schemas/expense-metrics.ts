import { z } from 'zod';

import { analysisPeriodSchema } from './expense-analysis';

const aggregateBucketSchema = z.object({
  key: z.string(),
  total: z.number(),
  count: z.number(),
});

const monthlyCategoryTotalSchema = z.object({
  month: z.string(),
  category: z.string(),
  total: z.number(),
});

const categoryChangeSchema = z.object({
  category: z.string(),
  earlierMonthlyAverage: z.number(),
  laterMonthlyAverage: z.number(),
  percentChange: z.number().nullable(),
});

const recurringCandidateSchema = z.object({
  key: z.string(),
  count: z.number(),
  averageAmount: z.number(),
  expenseIds: z.array(z.string()),
});

const signalHitSchema = z.object({
  expenseId: z.string(),
  reasons: z.array(z.string()),
});

export const expenseMetricsSchema = z.object({
  period: analysisPeriodSchema,
  expenseCount: z.number(),
  debitCount: z.number(),
  creditCount: z.number(),
  debitTotal: z.number(),
  creditTotal: z.number(),
  debitAverage: z.number().nullable(),
  debitMedian: z.number().nullable(),
  debitStdDev: z.number().nullable(),
  monthsCovered: z.number(),
  monthlyTotals: z.array(aggregateBucketSchema),
  categoryTotals: z.array(aggregateBucketSchema),
  counterpartyTotals: z.array(aggregateBucketSchema),
  monthlyCategoryTotals: z.array(monthlyCategoryTotalSchema),
  categoryChanges: z.array(categoryChangeSchema),
  recurringCandidates: z.array(recurringCandidateSchema),
  foreignCountryExpenses: z.array(
    z.object({
      expenseId: z.string(),
      countryCode: z.string(),
      amount: z.number(),
      bookingDate: z.string(),
    })
  ),
  largeOutliers: z.array(
    z.object({
      expenseId: z.string(),
      amount: z.number(),
      zScore: z.number().nullable(),
      medianMultiple: z.number().nullable(),
    })
  ),
  stressSignals: z.array(signalHitSchema),
  unhealthyLifestyleSignals: z.array(signalHitSchema),
  incomeByCounterparty: z.array(aggregateBucketSchema),
  subscriptionOverlapSignals: z.array(
    z.object({
      subscriptionIds: z.array(z.string()),
      reason: z.string(),
    })
  ),
  dataSufficiency: z.object({
    monthsCovered: z.number(),
    hasGeoData: z.boolean(),
    hasCategoryData: z.boolean(),
    hasPartyData: z.boolean(),
    hasMultiMonthHistory: z.boolean(),
  }),
});

export type ExpenseMetricsOutput = z.infer<typeof expenseMetricsSchema>;
