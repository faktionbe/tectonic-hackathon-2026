import {
  financialGoalSchema,
  type Profile,
  profileSchema,
  serviceInterestSchema,
} from '@repo/contracts';
import { renameKeys } from '@repo/shared';
import { z } from 'zod';

import { offsetPaginatedResultSchema } from '@/modules/pagination/pagination.utils';

const moneyFromDecimal = z.preprocess((val) => {
  if (val == null) {
    return val;
  }
  if (typeof val === 'object' && 'toNumber' in val) {
    return (val as { toNumber: () => number }).toNumber();
  }
  if (typeof val === 'string') {
    return Number(val);
  }
  return val;
}, z.number().nullable());

const isoDateFromDate = z.preprocess((val) => {
  if (val == null) {
    return val;
  }
  if (val instanceof Date) {
    return val.toISOString().slice(0, 10);
  }
  return val;
}, z.iso.date().nullable());

const isoDateTimeFromDate = z.preprocess((val) => {
  if (val instanceof Date) {
    return val.toISOString();
  }
  return val;
}, z.iso.datetime());

/** Response schema: contracts Profile with Prisma Decimal/Date coercion. */
export const profileResponseSchema = profileSchema
  .extend({
    dateOfBirth: isoDateFromDate,
    employmentStartDate: isoDateFromDate,
    monthlyHousingCost: moneyFromDecimal,
    monthlyNetIncome: moneyFromDecimal,
    otherMonthlyIncome: moneyFromDecimal,
    monthlyEssentialExpenses: moneyFromDecimal,
    monthlyDiscretionaryExpenses: moneyFromDecimal,
    monthlySavingsTarget: moneyFromDecimal,
    liquidSavings: moneyFromDecimal,
    investmentBalance: moneyFromDecimal,
    pensionBalance: moneyFromDecimal,
    realEstateValue: moneyFromDecimal,
    mortgageBalance: moneyFromDecimal,
    consumerDebtBalance: moneyFromDecimal,
    otherDebtBalance: moneyFromDecimal,
    createdAt: isoDateTimeFromDate,
    updatedAt: isoDateTimeFromDate,
  })
  .meta({ id: 'Profile' });

export type ProfileResponse = z.infer<typeof profileResponseSchema>;

const profileWritableSchema = profileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createProfileSchema = profileWritableSchema
  .partial()
  .required({
    firstName: true,
    lastName: true,
  })
  .extend({
    dependentCount: z.number().int().default(0),
    currency: z.string().length(3).default('EUR'),
    goals: z.array(financialGoalSchema).default([]),
    serviceInterests: z.array(serviceInterestSchema).default([]),
  })
  .meta({ id: 'CreateProfileRequest' });

export type CreateProfileRequest = z.infer<typeof createProfileSchema>;

export const updateProfileSchema = profileWritableSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  })
  .meta({ id: 'UpdateProfileRequest' });

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;

export const offsetPaginatedProfilesSchema = offsetPaginatedResultSchema(
  profileResponseSchema
).meta({ id: 'OffsetPaginatedProfiles' });

export type OffsetPaginatedProfiles = z.infer<
  typeof offsetPaginatedProfilesSchema
>;

/** API field → Prisma column. Single source of truth for both mapping directions. */
const profileColumnByField = {
  id: 'id',
  firstName: 'first_name',
  lastName: 'last_name',
  dateOfBirth: 'date_of_birth',
  email: 'email',
  phone: 'phone',
  customerReference: 'customer_reference',
  maritalStatus: 'marital_status',
  dependentCount: 'dependent_count',
  street: 'street',
  city: 'city',
  postalCode: 'postal_code',
  country: 'country',
  housingStatus: 'housing_status',
  monthlyHousingCost: 'monthly_housing_cost',
  employmentStatus: 'employment_status',
  occupation: 'occupation',
  employer: 'employer',
  employmentStartDate: 'employment_start_date',
  currency: 'currency',
  monthlyNetIncome: 'monthly_net_income',
  otherMonthlyIncome: 'other_monthly_income',
  financialLiteracy: 'financial_literacy',
  riskTolerance: 'risk_tolerance',
  goals: 'goals',
  serviceInterests: 'service_interests',
  monthlyEssentialExpenses: 'monthly_essential_expenses',
  monthlyDiscretionaryExpenses: 'monthly_discretionary_expenses',
  monthlySavingsTarget: 'monthly_savings_target',
  liquidSavings: 'liquid_savings',
  investmentBalance: 'investment_balance',
  pensionBalance: 'pension_balance',
  realEstateValue: 'real_estate_value',
  mortgageBalance: 'mortgage_balance',
  consumerDebtBalance: 'consumer_debt_balance',
  otherDebtBalance: 'other_debt_balance',
  hasLifeInsurance: 'has_life_insurance',
  hasHomeInsurance: 'has_home_insurance',
  hasHealthInsurance: 'has_health_insurance',
  hasBrokerageAccount: 'has_brokerage_account',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
} as const satisfies Record<keyof Profile, string>;

const profileFieldByColumn = Object.fromEntries(
  Object.entries(profileColumnByField).map(([field, column]) => [column, field])
);

/** Prisma `profile` row → API Profile. */
export const profileRowSchema = z
  .record(z.string(), z.unknown())
  .transform((row) => renameKeys(row, profileFieldByColumn))
  .pipe(profileResponseSchema);

// Prisma rejects date-only ISO strings for DateTime columns, so hand it a Date.
const dateFromIsoDate = z.iso
  .date()
  .transform((value) => new Date(value))
  .nullable()
  .optional();

const profilePrismaDateFields = {
  dateOfBirth: dateFromIsoDate,
  employmentStartDate: dateFromIsoDate,
};

/** CreateProfileRequest → Prisma `profile` create data. */
export const profileCreateInputSchema = createProfileSchema
  .extend(profilePrismaDateFields)
  .transform((data) => renameKeys(data, profileColumnByField));

/** UpdateProfileRequest → Prisma `profile` update data. */
export const profileUpdateInputSchema = profileWritableSchema
  .partial()
  .extend(profilePrismaDateFields)
  .transform((data) => renameKeys(data, profileColumnByField));
