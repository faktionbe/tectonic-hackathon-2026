import { env } from '@/env';

import {
  type CustomerProfile,
  customerProfileSchema,
  type ExistingProductHolding,
  existingProductHoldingSchema,
  type FinancesInput,
  financesInputSchema,
} from '../schemas/savings-advice';

import { getMockCustomerInput } from './mock-customer-data';

/**
 * WARNING: Temporary customer-data clients.
 *
 * These call placeholder HTTP paths and fall back to in-memory mocks until the
 * real customer profile / finances endpoints exist. Replace the URL paths and
 * response mapping here when those APIs are available — do not leave mocks in
 * production once the real services are wired.
 */

export interface CustomerProfileResponse {
  profile: CustomerProfile;
  existingProducts: Array<ExistingProductHolding>;
}

export interface CustomerFinancesResponse {
  finances: FinancesInput;
}

const profileResponseSchema = customerProfileSchema;
const holdingsSchema = existingProductHoldingSchema.array();

function shouldUseMocks(): boolean {
  return env.CUSTOMER_DATA_USE_MOCKS || !env.CUSTOMER_DATA_BASE_URL;
}

function mockProfile(customerId: string): CustomerProfileResponse {
  const input = getMockCustomerInput(customerId);
  return {
    profile: input.profile,
    existingProducts: input.existingProducts,
  };
}

function mockFinances(customerId: string): CustomerFinancesResponse {
  const input = getMockCustomerInput(customerId);
  return {
    finances: input.finances,
  };
}

function logMockWarning(customerId: string, resource: string): void {
  console.warn(
    `[savings-advice] WARNING: using MOCK ${resource} for customerId=${customerId}. ` +
      'Adapt data-clients.ts to the real customer-data endpoints when available.'
  );
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(
      `Customer data request failed (${response.status}) for ${url}`
    );
  }

  return response.json();
}

/**
 * WARNING: Placeholder path `/customers/{id}/profile` — swap for the real API.
 */
export async function fetchCustomerProfile(
  customerId: string
): Promise<CustomerProfileResponse> {
  if (shouldUseMocks()) {
    logMockWarning(customerId, 'profile');
    return mockProfile(customerId);
  }

  const baseUrl = env.CUSTOMER_DATA_BASE_URL;
  if (!baseUrl) {
    logMockWarning(customerId, 'profile');
    return mockProfile(customerId);
  }

  const url = `${baseUrl.replace(/\/$/u, '')}/customers/${encodeURIComponent(customerId)}/profile`;

  try {
    const json = await fetchJson(url);
    const body = json as {
      profile?: unknown;
      existingProducts?: unknown;
    };

    const profile = profileResponseSchema.parse(body.profile ?? body);
    const existingProducts = holdingsSchema.parse(body.existingProducts ?? []);

    return { profile, existingProducts };
  } catch (error) {
    console.warn(
      `[savings-advice] WARNING: real profile fetch failed for ${customerId}; falling back to mock.`,
      error instanceof Error ? error.message : error
    );
    return mockProfile(customerId);
  }
}

/**
 * WARNING: Placeholder path `/customers/{id}/finances` — swap for the real API.
 */
export async function fetchCustomerFinances(
  customerId: string
): Promise<CustomerFinancesResponse> {
  if (shouldUseMocks()) {
    logMockWarning(customerId, 'finances');
    return mockFinances(customerId);
  }

  const baseUrl = env.CUSTOMER_DATA_BASE_URL;
  if (!baseUrl) {
    logMockWarning(customerId, 'finances');
    return mockFinances(customerId);
  }

  const url = `${baseUrl.replace(/\/$/u, '')}/customers/${encodeURIComponent(customerId)}/finances`;

  try {
    const json = await fetchJson(url);
    const body = json as { finances?: unknown };
    const finances = financesInputSchema.parse(body.finances ?? body);
    return { finances };
  } catch (error) {
    console.warn(
      `[savings-advice] WARNING: real finances fetch failed for ${customerId}; falling back to mock.`,
      error instanceof Error ? error.message : error
    );
    return mockFinances(customerId);
  }
}
