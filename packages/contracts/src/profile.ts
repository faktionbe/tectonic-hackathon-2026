import { z } from 'zod';

export const maritalStatusSchema = z.enum([
  'SINGLE',
  'MARRIED',
  'PARTNERED',
  'DIVORCED',
  'WIDOWED',
  'OTHER',
]);

export const housingStatusSchema = z.enum([
  'OWNER_OUTRIGHT',
  'OWNER_WITH_MORTGAGE',
  'RENTER',
  'LIVING_WITH_FAMILY',
  'OTHER',
]);

export const employmentStatusSchema = z.enum([
  'EMPLOYED',
  'SELF_EMPLOYED',
  'UNEMPLOYED',
  'STUDENT',
  'RETIRED',
  'OTHER',
]);

export const financialLiteracySchema = z.enum([
  'LOW',
  'DEVELOPING',
  'CAPABLE',
  'EXPERT',
]);

export const riskToleranceSchema = z.enum([
  'CONSERVATIVE',
  'MODERATE',
  'BALANCED',
  'GROWTH',
  'AGGRESSIVE',
]);

export const financialGoalSchema = z.enum([
  'EMERGENCY_FUND',
  'REDUCE_SPENDING',
  'REDUCE_DEBT',
  'BUY_HOME',
  'RETIREMENT',
  'EDUCATION',
  'GROW_INVESTMENTS',
  'PROTECT_INCOME',
]);

export const serviceInterestSchema = z.enum([
  'SAVINGS',
  'INSURANCE',
  'BROKER',
  'INVESTING',
  'PENSION',
  'CREDIT',
  'FINANCIAL_COACHING',
]);

export const profileSchema = z
  .object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.iso.date().nullable(),
    email: z.email().nullable(),
    phone: z.string().nullable(),
    customerReference: z.string().nullable(),

    maritalStatus: maritalStatusSchema.nullable(),
    dependentCount: z.number().int(),
    street: z.string().nullable(),
    city: z.string().nullable(),
    postalCode: z.string().nullable(),
    country: z.string().nullable(),
    housingStatus: housingStatusSchema.nullable(),
    monthlyHousingCost: z.number().nullable(),

    employmentStatus: employmentStatusSchema.nullable(),
    occupation: z.string().nullable(),
    employer: z.string().nullable(),
    employmentStartDate: z.iso.date().nullable(),
    currency: z.string().length(3),
    monthlyNetIncome: z.number().nullable(),
    otherMonthlyIncome: z.number().nullable(),

    financialLiteracy: financialLiteracySchema.nullable(),
    riskTolerance: riskToleranceSchema.nullable(),
    goals: z.array(financialGoalSchema),
    serviceInterests: z.array(serviceInterestSchema),

    monthlyEssentialExpenses: z.number().nullable(),
    monthlyDiscretionaryExpenses: z.number().nullable(),
    monthlySavingsTarget: z.number().nullable(),
    liquidSavings: z.number().nullable(),
    investmentBalance: z.number().nullable(),
    pensionBalance: z.number().nullable(),
    realEstateValue: z.number().nullable(),
    mortgageBalance: z.number().nullable(),
    consumerDebtBalance: z.number().nullable(),
    otherDebtBalance: z.number().nullable(),

    hasLifeInsurance: z.boolean().nullable(),
    hasHomeInsurance: z.boolean().nullable(),
    hasHealthInsurance: z.boolean().nullable(),
    hasBrokerageAccount: z.boolean().nullable(),
    notes: z.string().nullable(),

    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: 'Profile' });

export type Profile = z.infer<typeof profileSchema>;
