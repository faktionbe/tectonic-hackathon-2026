import { getProducts } from '@repo/kbc-products';
import { describe, expect, it } from 'vitest';

import { computeSavingsAdviceMetrics } from '../../src/mastra/savings-advice/metrics';
import { getMockCustomerInput } from '../../src/mastra/savings-advice/mock-customer-data';
import {
  customerFinancesToolOutputSchema,
  customerProfileToolOutputSchema,
  fetchCustomerFinancesTool,
  fetchCustomerProfileTool,
  fetchKbcProductsTool,
  kbcProductsToolOutputSchema,
} from '../../src/mastra/tools/customer-data-tools';

import { CUSTOMER_IDS, thinBufferFixture } from './fixtures/scenarios';

async function execute<TInput, TResult>(
  tool: {
    execute?: (input: TInput, context: never) => Promise<TResult>;
  },
  input: TInput
): Promise<TResult> {
  if (!tool.execute) {
    throw new Error('Tool is missing execute');
  }

  return tool.execute(input, undefined as never);
}

describe('customer data tools', () => {
  it('returns mock profile and holdings for a known customer id', async () => {
    const result = customerProfileToolOutputSchema.parse(
      await execute(fetchCustomerProfileTool, {
        customerId: CUSTOMER_IDS.thinBuffer,
      })
    );

    expect(result.profile).toEqual(thinBufferFixture.profile);
    expect(result.existingProducts).toEqual(thinBufferFixture.existingProducts);
  });

  it('returns mock finances and deterministic metrics', async () => {
    const result = customerFinancesToolOutputSchema.parse(
      await execute(fetchCustomerFinancesTool, {
        customerId: CUSTOMER_IDS.thinBuffer,
      })
    );
    const expected = getMockCustomerInput(CUSTOMER_IDS.thinBuffer);

    expect(result.finances).toEqual(expected.finances);
    expect(result.metrics).toEqual(
      computeSavingsAdviceMetrics(expected.finances)
    );
  });

  it('falls back to the default mock for an unknown customer id', async () => {
    const result = customerProfileToolOutputSchema.parse(
      await execute(fetchCustomerProfileTool, {
        customerId: 'customer_unknown_xyz',
      })
    );

    expect(result.profile.financialLiteracy).toBe(
      thinBufferFixture.profile.financialLiteracy
    );
  });

  it('defaults the catalogue to saving and investing products', async () => {
    const result = kbcProductsToolOutputSchema.parse(
      await execute(fetchKbcProductsTool, {})
    );
    const expectedIds = getProducts(['saving', 'investing']).map(
      (product) => product.id
    );

    expect(result.products.map((product) => product.id)).toEqual(expectedIds);
    expect(
      result.products.some((product) => product.category === 'paying')
    ).toBe(false);
  });

  it('returns only the requested catalogue category', async () => {
    const result = kbcProductsToolOutputSchema.parse(
      await execute(fetchKbcProductsTool, {
        categories: ['paying'],
      })
    );

    expect(
      result.products.every((product) => product.category === 'paying')
    ).toBe(true);
    expect(result.products.map((product) => product.id)).toContain(
      'current-account'
    );
  });
});
