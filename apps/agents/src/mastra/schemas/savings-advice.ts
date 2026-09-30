import { expenseSchema } from '@repo/contracts';
import { z } from 'zod';

export const financialLiteracySchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
]);

export type FinancialLiteracy = z.infer<typeof financialLiteracySchema>;

export const riskToleranceSchema = z.enum(['low', 'medium', 'high']);

export type RiskTolerance = z.infer<typeof riskToleranceSchema>;

export const investmentHorizonSchema = z.enum(['short', 'medium', 'long']);

export type InvestmentHorizon = z.infer<typeof investmentHorizonSchema>;

export const liquidityNeedsSchema = z.enum(['low', 'medium', 'high']);

export type LiquidityNeeds = z.infer<typeof liquidityNeedsSchema>;

export const ageCategorySchema = z.enum([
  'under_30',
  '30_45',
  '45_60',
  'over_60',
]);

export type AgeCategory = z.infer<typeof ageCategorySchema>;

export const adviceStrategySchema = z.enum([
  'build_emergency_buffer',
  'increase_savings_rate',
  'start_investing',
  'invest_gradually',
  'optimize_existing_products',
  'pension_planning',
  'rebalance_risk',
  'preserve_liquidity',
  'stay_the_course',
  'insufficient_data',
]);

export type AdviceStrategy = z.infer<typeof adviceStrategySchema>;

export const ADVICE_STRATEGIES = adviceStrategySchema.options;

export const customerProfileSchema = z.object({
  financialLiteracy: financialLiteracySchema,
  riskTolerance: riskToleranceSchema,
  goals: z.array(z.string()),
  investmentHorizon: investmentHorizonSchema,
  liquidityNeeds: liquidityNeedsSchema,
  ageCategory: ageCategorySchema,
  notes: z.string().optional(),
});

export type CustomerProfile = z.infer<typeof customerProfileSchema>;

export const existingProductHoldingSchema = z.object({
  productId: z.string().min(1),
  productType: z.string().optional(),
  amountHeld: z.number().nonnegative(),
  currency: z.string().length(3),
  characteristics: z.string().optional(),
});

export type ExistingProductHolding = z.infer<
  typeof existingProductHoldingSchema
>;

export const investmentAllocationItemSchema = z.object({
  label: z.string().min(1),
  amount: z.number().nonnegative(),
  currency: z.string().length(3),
});

export type InvestmentAllocationItem = z.infer<
  typeof investmentAllocationItemSchema
>;

export const financesInputSchema = z
  .object({
    monthlyIncome: z.number().nonnegative().optional(),
    monthlyExpenses: z.number().nonnegative().optional(),
    currentSavings: z.number().nonnegative(),
    periodMonths: z.number().positive().optional(),
    investmentAllocation: z.array(investmentAllocationItemSchema).optional(),
    expenseLines: z.array(expenseSchema).optional(),
  })
  .superRefine((finances, ctx) => {
    const hasAggregates =
      finances.monthlyIncome !== undefined &&
      finances.monthlyExpenses !== undefined;
    const hasLines =
      finances.expenseLines !== undefined && finances.expenseLines.length > 0;

    if (!hasAggregates && !hasLines) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Provide monthlyIncome and monthlyExpenses, or non-empty expenseLines',
        path: ['monthlyIncome'],
      });
    }
  });

export type FinancesInput = z.infer<typeof financesInputSchema>;

/** A2A / HTTP request: caller only provides a customer id; data is fetched upstream. */
export const savingsAdviceRequestSchema = z.object({
  customerId: z.string().min(1),
});

export type SavingsAdviceRequest = z.infer<typeof savingsAdviceRequestSchema>;

export const savingsAdviceInputSchema = z.object({
  profile: customerProfileSchema,
  existingProducts: z.array(existingProductHoldingSchema).default([]),
  finances: financesInputSchema,
});

export type SavingsAdviceInput = z.infer<typeof savingsAdviceInputSchema>;

/** Schema sent to Node 1 (JSON-schema friendly, no refinements). */
export const adviceSelectionBaseSchema = z.object({
  primaryStrategy: adviceStrategySchema,
  /**
   * Null when no secondary strategy applies.
   * Use union+null (not .optional()) so Azure/OpenAI structured output
   * keeps this key in `required`.
   */
  secondaryStrategy: z.union([adviceStrategySchema, z.null()]),
  relevantProductIds: z.array(z.string()),
  keyFactors: z.array(z.string().min(1)).min(1),
  rationale: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export type AdviceSelectionBase = z.infer<typeof adviceSelectionBaseSchema>;

export const adviceSelectionSchema = adviceSelectionBaseSchema.superRefine(
  (selection, ctx) => {
    if (
      selection.secondaryStrategy !== null &&
      selection.secondaryStrategy === selection.primaryStrategy
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'secondaryStrategy must differ from primaryStrategy',
        path: ['secondaryStrategy'],
      });
    }
  }
);

export type AdviceSelection = z.infer<typeof adviceSelectionSchema>;

export const supportingNumbersSchema = z.object({
  totalIncome: z.number(),
  totalExpenses: z.number(),
  currentSavings: z.number(),
  monthlySurplus: z.number(),
  savingsRate: z.number().nullable(),
  savingsExpenseCoverageMonths: z.number().nullable(),
  investmentAllocationTotal: z.number().nullable(),
});

export type SupportingNumbers = z.infer<typeof supportingNumbersSchema>;

export const savingsAdviceMetricsSchema = z.object({
  totalIncome: z.number(),
  totalExpenses: z.number(),
  currentSavings: z.number(),
  monthlySurplus: z.number(),
  savingsRate: z.number().nullable(),
  savingsExpenseCoverageMonths: z.number().nullable(),
  investmentAllocation: z.array(investmentAllocationItemSchema),
  investmentAllocationTotal: z.number().nullable(),
  periodMonths: z.number(),
  dataSufficiency: z.object({
    hasIncome: z.boolean(),
    hasExpenses: z.boolean(),
    hasSavings: z.boolean(),
    usedExpenseLines: z.boolean(),
  }),
});

export type SavingsAdviceMetricsSchema = z.infer<
  typeof savingsAdviceMetricsSchema
>;

export const catalogueProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['paying', 'saving', 'investing', 'borrowing', 'insurance']),
  description: z.string(),
  relevantFor: z.string(),
  watchOut: z.string().nullable(),
});

/** Schema sent to Node 2 for personalization copy. */
export const advicePersonalizationBaseSchema = z.object({
  adviceStatement: z.string().min(1),
});

export type AdvicePersonalizationBase = z.infer<
  typeof advicePersonalizationBaseSchema
>;

export const savingsAdviceResultSchema = z.object({
  primaryStrategy: adviceStrategySchema,
  secondaryStrategy: adviceStrategySchema.nullable(),
  relevantProductIds: z.array(z.string()),
  keyFactors: z.array(z.string().min(1)).min(1),
  rationale: z.string().min(1),
  confidence: z.number().min(0).max(1),
  adviceStatement: z.string().min(1),
  literacyLevelUsed: financialLiteracySchema,
  supportingNumbers: supportingNumbersSchema,
});

export type SavingsAdviceResult = z.infer<typeof savingsAdviceResultSchema>;
