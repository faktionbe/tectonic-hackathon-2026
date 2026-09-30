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
  'REVIEW_FINANCES',
  'PLAN_FINANCES',
  'REVIEW_BUDGET',
  'ADD_TO_BUDGET',
  'HOME_BUDGET',
  'VIEW_RETIREMENT',
]);

export type InsightActionType = z.infer<typeof insightActionTypeSchema>;

export const insightActionSchema = z.object({
  label: z.string().min(1),
  type: insightActionTypeSchema,
});

export type InsightAction = z.infer<typeof insightActionSchema>;

/** LLM structured output: wording only. */
export const insightCopySchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
});

export type InsightCopy = z.infer<typeof insightCopySchema>;

export const financialInsightSchema = z.object({
  label: useCaseLabelSchema,
  confidence: z.number().min(0).max(1),
  title: z.string().min(1),
  message: z.string().min(1),
  action: insightActionSchema,
});

export type FinancialInsight = z.infer<typeof financialInsightSchema>;

/** Workflow/API output after detection + insight generation. */
export const expenseAnalysisWithInsightsSchema = z.object({
  period: analysisPeriodSchema,
  useCases: z.array(useCaseResultBaseSchema),
  insights: z.array(financialInsightSchema),
});

export type ExpenseAnalysisWithInsights = z.infer<
  typeof expenseAnalysisWithInsightsSchema
>;
