import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchCustomerFinances,
  fetchCustomerProfile,
} from '../../src/mastra/savings-advice/data-clients';
import { loadSavingsAdviceInput } from '../../src/mastra/savings-advice/run-for-customer';

import { CUSTOMER_IDS, thinBufferFixture } from './fixtures/scenarios';

vi.mock('@/env', () => ({
  env: {
    DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:5432/tectonic',
    OPENROUTER_API_KEY: 'test-key',
    CUSTOMER_DATA_USE_MOCKS: true,
    CUSTOMER_DATA_BASE_URL: undefined,
  },
}));

describe('customer data clients (mocks)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('returns mock profile and holdings for a known customer id', async () => {
    const result = await fetchCustomerProfile(CUSTOMER_IDS.thinBuffer);

    expect(result.profile).toEqual(thinBufferFixture.profile);
    expect(result.existingProducts).toEqual(thinBufferFixture.existingProducts);
  });

  it('returns mock finances for a known customer id', async () => {
    const result = await fetchCustomerFinances(CUSTOMER_IDS.thinBuffer);

    expect(result.finances).toEqual(thinBufferFixture.finances);
  });

  it('falls back to default mock for unknown customer ids', async () => {
    const result = await fetchCustomerProfile('customer_unknown_xyz');

    expect(result.profile.financialLiteracy).toBe(
      thinBufferFixture.profile.financialLiteracy
    );
  });

  it('loadSavingsAdviceInput merges profile and finances mocks', async () => {
    const input = await loadSavingsAdviceInput(CUSTOMER_IDS.readyToInvest);

    expect(input.profile.investmentHorizon).toBe('long');
    expect(input.finances.currentSavings).toBe(18_000);
    expect(input.existingProducts[0]?.productId).toBe('savings-account');
  });
});
