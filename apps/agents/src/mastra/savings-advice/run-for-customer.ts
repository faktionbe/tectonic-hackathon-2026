import type {
  SavingsAdviceInput,
  SavingsAdviceResult,
} from '../schemas/savings-advice';

import { fetchCustomerFinances, fetchCustomerProfile } from './data-clients';
import { generateAdvice, type SavingsAdviceAgents } from './generate-advice';

export async function loadSavingsAdviceInput(
  customerId: string
): Promise<SavingsAdviceInput> {
  const [profileResponse, financesResponse] = await Promise.all([
    fetchCustomerProfile(customerId),
    fetchCustomerFinances(customerId),
  ]);

  return {
    profile: profileResponse.profile,
    existingProducts: profileResponse.existingProducts,
    finances: financesResponse.finances,
  };
}

/**
 * A2A / HTTP entry path: load customer data from (mocked) upstream APIs,
 * then run selection + personalization.
 */
export async function runSavingsAdviceForCustomer(
  customerId: string,
  agents: SavingsAdviceAgents
): Promise<SavingsAdviceResult> {
  const input = await loadSavingsAdviceInput(customerId);
  return generateAdvice(input, agents);
}
