import { z } from 'zod';

export const expenseCategorySchema = z.enum([
  'HOUSING',
  'UTILITIES',
  'GROCERIES',
  'TRANSPORT',
  'ENTERTAINMENT',
  'DINING',
  'HEALTH',
  'INSURANCE',
  'EDUCATION',
  'SHOPPING',
  'TRAVEL',
  'SUBSCRIPTIONS',
  'FEES',
  'TAXES',
  'OTHER',
]);

export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;

export const expenseCadenceSchema = z.enum([
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'YEARLY',
  'IRREGULAR',
]);

export type ExpenseCadence = z.infer<typeof expenseCadenceSchema>;

export const expenseDirectionSchema = z.enum(['DEBIT', 'CREDIT']);

export type ExpenseDirection = z.infer<typeof expenseDirectionSchema>;

export const expenseTypeSchema = z.enum([
  'CARD_PAYMENT',
  'CONTACTLESS',
  'SEPA_DIRECT_DEBIT',
  'SEPA_CREDIT_TRANSFER',
  'STANDING_ORDER',
  'INSTANT_PAYMENT',
  'ATM_WITHDRAWAL',
  'FEE',
  'INTEREST',
  'REVERSAL',
  'OTHER',
]);

export type ExpenseType = z.infer<typeof expenseTypeSchema>;

export const expenseStatusSchema = z.enum(['PENDING', 'BOOKED', 'REVERSED']);

export type ExpenseStatus = z.infer<typeof expenseStatusSchema>;

export const expenseChannelSchema = z.enum([
  'POS',
  'ATM',
  'ECOMMERCE',
  'MOBILE',
  'BRANCH',
  'RECURRING',
]);

export type ExpenseChannel = z.infer<typeof expenseChannelSchema>;

export const expenseEssentialitySchema = z.enum([
  'ESSENTIAL',
  'DISCRETIONARY',
  'MIXED',
]);

export type ExpenseEssentiality = z.infer<typeof expenseEssentialitySchema>;

/** A single booked (or pending) transaction line on an account. */
export const expenseSchema = z
  .object({
    id: z.string(),
    accountId: z.string(),
    iban: z.string().optional(),

    amount: z.number().positive().meta({
      description: 'Absolute booked amount (always positive); see direction',
    }),
    currency: z.string().length(3).meta({ description: 'ISO 4217 code' }),
    direction: expenseDirectionSchema,

    bookingDate: z.iso.date(),
    valueDate: z.iso.date().optional(),
    transactionTimestamp: z.iso.datetime().optional().meta({
      description: 'Authorization moment; key for right-moment triggers',
    }),

    type: expenseTypeSchema,
    status: expenseStatusSchema,

    description: z
      .string()
      .optional()
      .meta({ description: 'Unstructured remittance / statement text' }),
    structuredReference: z
      .string()
      .optional()
      .meta({ description: 'Belgian OGM/VCS structured reference +++...+++' }),
    mcc: z
      .string()
      .regex(/^\d{4}$/u)
      .optional()
      .meta({ description: 'Card-network merchant category code' }),
    channel: expenseChannelSchema.optional(),
    balanceAfter: z.number().optional(),
    city: z.string().optional(),
    countryCode: z.string().length(2).optional(),

    category: expenseCategorySchema.optional(),
    subCategory: z.string().optional(),
    essentiality: expenseEssentialitySchema.optional().meta({
      description: 'Essential vs discretionary; enables surplus detection',
    }),

    counterpartyId: z.string().optional().meta({
      description: 'Party (merchant or person) on the other side of the line',
    }),
    subscriptionId: z.string().optional().meta({
      description: 'Set when this line is a charge of a Subscription',
    }),
  })
  .meta({ id: 'Expense' });

export type Expense = z.infer<typeof expenseSchema>;
