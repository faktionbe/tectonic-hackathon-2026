import { z } from 'zod';

import {
  analysisPeriodSchema,
  useCaseLabelSchema,
  useCaseResultBaseSchema,
} from './expense-analysis';

export const insightActionTypeSchema = z.enum([
  'REVIEW_EXPENSES',
  'VIEW_TRANSACTIONS',
  'TRACK_TRIP',
  'SET_BUDGET',
  'SEE_SPENDING',
  'REVIEW_FINANCES',
  'SPENDING_CONTROLS',
  'SUPPORT',
  'SHARED_FINANCES',
  'SAVINGS',
  'BABY_BUDGET',
  'SAVINGS_GOAL',
  'BUDGET',
  'SAVINGS_PLAN',
  'ADD_TO_BUDGET',
  'HOME_BUDGET',
  'PENSION_OVERVIEW',
]);

export type InsightActionType = z.infer<typeof insightActionTypeSchema>;

export const insightActionSchema = z.object({
  label: z.string().min(1),
  type: insightActionTypeSchema,
});

export type InsightAction = z.infer<typeof insightActionSchema>;

export const insightDetailSchema = z.object({
  label: z.literal('See what changed'),
  transactionIds: z.array(z.string()),
});

export type InsightDetail = z.infer<typeof insightDetailSchema>;

export const insightDismissSchema = z.object({
  label: z.literal('Dismiss'),
  type: z.literal('DISMISS'),
});

export type InsightDismiss = z.infer<typeof insightDismissSchema>;

export const INSIGHT_PROMPT = 'What would you like to do?';

export const insightCopySchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
});

export type InsightCopy = z.infer<typeof insightCopySchema>;

export const transactionExampleSchema = z.object({
  transactionId: z.string(),
  bookingDate: z.string().optional(),
  amount: z.number(),
  currency: z.string(),
  category: z.string().optional(),
  counterparty: z.string().optional(),
  countryCode: z.string().optional(),
  balanceAfter: z.number().optional(),
});

export type TransactionExample = z.infer<typeof transactionExampleSchema>;

export const labelFactsSchema = z.object({
  examples: z.array(transactionExampleSchema),
  lines: z.array(z.string()),
  lifestyle: z
    .object({
      category: z.string(),
      earlierMonthlyAverage: z.number(),
      laterMonthlyAverage: z.number(),
      percentChange: z.number().nullable(),
    })
    .optional(),
  travel: z
    .object({
      countryName: z.string(),
      total: z.number(),
    })
    .optional(),
  highlight: z
    .object({
      amount: z.number(),
      counterparty: z.string().optional(),
    })
    .optional(),
  belowZeroCount: z.number().int().nonnegative().optional(),
  relatedTotal: z.number().optional(),
});

export type LabelFacts = z.infer<typeof labelFactsSchema>;

export const factsByLabelSchema = z.partialRecord(
  useCaseLabelSchema,
  labelFactsSchema
);

export const financialInsightSchema = z.object({
  label: useCaseLabelSchema,
  confidence: z.number().min(0).max(1),
  title: z.string().min(1),
  message: z.string().min(1),
  detail: insightDetailSchema,
  prompt: z.literal(INSIGHT_PROMPT),
  actions: z.array(insightActionSchema).min(1),
  dismiss: insightDismissSchema,
});

export type FinancialInsight = z.infer<typeof financialInsightSchema>;

export const expenseAnalysisWithInsightsSchema = z.object({
  period: analysisPeriodSchema,
  useCases: z.array(useCaseResultBaseSchema),
  insights: z.array(financialInsightSchema),
});

export type ExpenseAnalysisWithInsights = z.infer<
  typeof expenseAnalysisWithInsightsSchema
>;

export const groundedExpenseAnalysisSchema = z.object({
  period: analysisPeriodSchema,
  useCases: z.array(useCaseResultBaseSchema),
  factsByLabel: factsByLabelSchema,
});
