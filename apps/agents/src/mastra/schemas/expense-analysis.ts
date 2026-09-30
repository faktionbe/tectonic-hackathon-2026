import {
  expenseSchema,
  partySchema,
  subscriptionSchema,
} from '@repo/contracts';
import { z } from 'zod';

export const useCaseLabelSchema = z.enum([
  'costs_could_be_optimized',
  'spending_anomaly',
  'travel_detected',
  'large_lifestyle_change',
  'financial_stress_signals',
  'life_event_marriage',
  'life_event_child',
  'life_event_job_change',
  'life_event_buying_car',
  'life_event_buying_home',
  'life_event_retirement',
  'unhealthy_lifestyle',
]);

export type UseCaseLabel = z.infer<typeof useCaseLabelSchema>;

export const USE_CASE_LABELS = useCaseLabelSchema.options;

export const useCaseStatusSchema = z.enum([
  'detected',
  'not_detected',
  'insufficient_data',
]);

export type UseCaseStatus = z.infer<typeof useCaseStatusSchema>;

export const evidenceSchema = z.object({
  transactionIds: z.array(z.string()).min(1),
  explanation: z.string().min(1),
});

export type Evidence = z.infer<typeof evidenceSchema>;

/** Schema sent to the model (JSON-schema friendly, no refinements). */
export const useCaseResultBaseSchema = z.object({
  label: useCaseLabelSchema,
  status: useCaseStatusSchema,
  confidence: z.number().min(0).max(1),
  summary: z.string().min(1),
  evidence: z.array(evidenceSchema),
});

export const useCaseResultSchema = useCaseResultBaseSchema.superRefine(
  (result, ctx) => {
    if (result.status === 'detected' && result.evidence.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Detected use cases must include at least one evidence item',
        path: ['evidence'],
      });
    }
  }
);

export type UseCaseResult = z.infer<typeof useCaseResultSchema>;

export const analysisPeriodSchema = z.object({
  start: z.string(),
  end: z.string(),
});

export type AnalysisPeriod = z.infer<typeof analysisPeriodSchema>;

/** Schema sent to the model for structured output. */
export const expenseAnalysisResultBaseSchema = z.object({
  period: analysisPeriodSchema,
  useCases: z.array(useCaseResultBaseSchema),
});

export const expenseAnalysisResultSchema =
  expenseAnalysisResultBaseSchema.superRefine((result, ctx) => {
    if (result.useCases.length !== USE_CASE_LABELS.length) {
      ctx.addIssue({
        code: 'custom',
        message: `Expected exactly ${USE_CASE_LABELS.length} use-case results`,
        path: ['useCases'],
      });
    }

    const labels = result.useCases.map((useCase) => useCase.label);
    const unique = new Set(labels);

    if (unique.size !== labels.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Each use-case label must appear exactly once',
        path: ['useCases'],
      });
    }

    for (const label of USE_CASE_LABELS) {
      if (!unique.has(label)) {
        ctx.addIssue({
          code: 'custom',
          message: `Missing use-case label: ${label}`,
          path: ['useCases'],
        });
      }
    }

    for (const [index, useCase] of result.useCases.entries()) {
      if (useCase.status === 'detected' && useCase.evidence.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Detected use cases must include at least one evidence item',
          path: ['useCases', index, 'evidence'],
        });
      }
    }
  });

export type ExpenseAnalysisResult = z.infer<typeof expenseAnalysisResultSchema>;

export const expenseAnalysisInputSchema = z.object({
  period: analysisPeriodSchema.optional(),
  homeCountryCode: z.string().length(2).optional(),
  expenses: z.array(expenseSchema).min(1),
  parties: z.array(partySchema).optional(),
  subscriptions: z.array(subscriptionSchema).optional(),
});

export type ExpenseAnalysisInput = z.infer<typeof expenseAnalysisInputSchema>;
