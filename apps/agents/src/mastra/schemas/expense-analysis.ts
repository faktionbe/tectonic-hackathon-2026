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

export const useCaseResultBaseSchema = z.object({
  label: useCaseLabelSchema,
  status: useCaseStatusSchema,
  confidence: z.number().min(0).max(1),
  summary: z.string().min(1),
  evidence: z.array(evidenceSchema),
});

export const useCaseAssessmentSchema = z.object({
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

export const expenseAnalysisModelOutputSchema = z.object({
  period: analysisPeriodSchema,
  useCases: z
    .object({
      costs_could_be_optimized: useCaseAssessmentSchema,
      spending_anomaly: useCaseAssessmentSchema,
      travel_detected: useCaseAssessmentSchema,
      large_lifestyle_change: useCaseAssessmentSchema,
      financial_stress_signals: useCaseAssessmentSchema,
      life_event_marriage: useCaseAssessmentSchema,
      life_event_child: useCaseAssessmentSchema,
      life_event_job_change: useCaseAssessmentSchema,
      life_event_buying_car: useCaseAssessmentSchema,
      life_event_buying_home: useCaseAssessmentSchema,
      life_event_retirement: useCaseAssessmentSchema,
      unhealthy_lifestyle: useCaseAssessmentSchema,
    } satisfies Record<UseCaseLabel, typeof useCaseAssessmentSchema>)
    .describe(
      'Every use-case label exactly once, as an object key rather than an array item.'
    ),
});

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

export const expenseAnalysisRequestSchema = z.object({
  customerId: z.string().min(1),
  period: analysisPeriodSchema.optional(),
  homeCountryCode: z.string().length(2).optional(),
});

export type ExpenseAnalysisRequest = z.infer<
  typeof expenseAnalysisRequestSchema
>;

export const expenseAnalysisInputSchema = z.object({
  period: analysisPeriodSchema.optional(),
  homeCountryCode: z.string().length(2).optional(),
  expenses: z.array(expenseSchema).min(1),
  parties: z.array(partySchema).optional(),
  subscriptions: z.array(subscriptionSchema).optional(),
});

export type ExpenseAnalysisInput = z.infer<typeof expenseAnalysisInputSchema>;
