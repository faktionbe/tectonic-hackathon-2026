import { createTool } from '@mastra/core/tools';
import { expenseSchema } from '@repo/contracts';
import { getProducts, PRODUCT_CATEGORIES } from '@repo/kbc-products';
import { z } from 'zod';

import {
  lastThreeMonthsPeriod,
  needsExpenseLinesFallback,
  toSavingsAdviceInput,
} from '../savings-advice/map-profile';
import { computeSavingsAdviceMetrics } from '../savings-advice/metrics';
import {
  catalogueProductSchema,
  customerProfileSchema,
  existingProductHoldingSchema,
  financesInputSchema,
  investmentAllocationItemSchema,
  savingsAdviceMetricsSchema,
} from '../schemas/savings-advice';
import {
  getProfileDetail,
  listExpenses,
  loadCustomerAccounts,
} from '../server-api/customer-api';

const DEFAULT_CATALOGUE_CATEGORIES = ['saving', 'investing'] as const;

const financesPayloadSchema = z.object({
  monthlyIncome: z.number().nonnegative().optional(),
  monthlyExpenses: z.number().nonnegative().optional(),
  currentSavings: z.number().nonnegative(),
  periodMonths: z.number().positive().optional(),
  investmentAllocation: z.array(investmentAllocationItemSchema).optional(),
  expenseLines: z.array(expenseSchema).optional(),
});

export const SAVINGS_SELECTION_TOOL_IDS = [
  'fetch_customer_profile',
  'fetch_customer_finances',
  'fetch_kbc_products',
] as const;

export const customerProfileToolOutputSchema = z.object({
  profile: customerProfileSchema,
  existingProducts: z.array(existingProductHoldingSchema),
});

export const customerFinancesToolOutputSchema = z.object({
  finances: financesPayloadSchema,
  metrics: savingsAdviceMetricsSchema,
});

export const kbcProductsToolOutputSchema = z.object({
  products: z.array(catalogueProductSchema),
});

export const fetchCustomerProfileTool = createTool({
  id: 'fetch_customer_profile',
  description:
    'Fetch a customer financial profile and existing product holdings. customerId is the Nest profile id.',
  inputSchema: z.object({
    customerId: z
      .string()
      .min(1)
      .describe('Profile id (Nest GET /profiles/:profileId)'),
  }),
  outputSchema: customerProfileToolOutputSchema,
  execute: async ({ customerId }) => {
    const profile = await getProfileDetail(customerId);
    const input = toSavingsAdviceInput(profile);

    return customerProfileToolOutputSchema.parse({
      profile: input.profile,
      existingProducts: input.existingProducts,
    });
  },
});

export const fetchCustomerFinancesTool = createTool({
  id: 'fetch_customer_finances',
  description:
    'Fetch customer income, expenses, and savings, plus deterministic metrics. Trust the metrics field. customerId is the Nest profile id.',
  inputSchema: z.object({
    customerId: z
      .string()
      .min(1)
      .describe('Profile id (Nest GET /profiles/:profileId)'),
  }),
  outputSchema: customerFinancesToolOutputSchema,
  execute: async ({ customerId }) => {
    const profile = await getProfileDetail(customerId);

    let expenseLines;
    if (needsExpenseLinesFallback(profile)) {
      const { accountIds } = await loadCustomerAccounts(customerId);
      expenseLines = await listExpenses({
        accountIds,
        period: lastThreeMonthsPeriod(),
      });
    }

    const input = toSavingsAdviceInput(profile, expenseLines);
    const finances = financesInputSchema.parse(input.finances);

    return customerFinancesToolOutputSchema.parse({
      finances,
      metrics: computeSavingsAdviceMetrics(finances),
    });
  },
});

export const fetchKbcProductsTool = createTool({
  id: 'fetch_kbc_products',
  description:
    'Fetch KBC catalogue products for the requested categories. Defaults to saving and investing.',
  inputSchema: z.object({
    categories: z
      .array(z.enum(PRODUCT_CATEGORIES))
      .optional()
      .describe(
        'Product categories to include. Defaults to saving and investing.'
      ),
  }),
  outputSchema: kbcProductsToolOutputSchema,
  execute: async ({ categories }) => {
    const selected =
      categories && categories.length > 0
        ? categories
        : [...DEFAULT_CATALOGUE_CATEGORIES];

    return kbcProductsToolOutputSchema.parse({
      products: getProducts(selected),
    });
  },
});
