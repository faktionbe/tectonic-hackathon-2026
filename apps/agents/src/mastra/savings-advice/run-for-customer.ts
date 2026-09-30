import type { Agent } from '@mastra/core/agent';

import type { SavingsAdviceResult } from '../schemas/savings-advice';

import { generateAdvice } from './generate-advice';

export async function runSavingsAdviceForCustomer(
  customerId: string,
  agent: Agent
): Promise<SavingsAdviceResult> {
  return generateAdvice(customerId, agent);
}
