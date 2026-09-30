import { registerApiRoute } from '@mastra/core/server';
import { ZodError } from 'zod';

import { advicePersonalizationAgent } from '../agents/advice-personalization-agent';
import { adviceSelectionAgent } from '../agents/advice-selection-agent';
import { runSavingsAdviceForCustomer } from '../savings-advice/run-for-customer';
import { savingsAdviceRequestSchema } from '../schemas/savings-advice';

/**
 * HTTP mirror of the A2A savings-advice-agent contract.
 * Body: { customerId }. Profile/finances are loaded via (mocked) upstream clients.
 */
export const savingsAdviceRoute = registerApiRoute('/savings-advice', {
  method: 'POST',
  handler: async (context) => {
    let body: unknown;

    try {
      body = await context.req.json();
    } catch {
      return context.json({ error: 'Invalid JSON body' }, 400);
    }

    const parsed = savingsAdviceRequestSchema.safeParse(body);
    if (!parsed.success) {
      return context.json(
        {
          error: 'Invalid savings advice input',
          details: parsed.error.flatten(),
        },
        400
      );
    }

    try {
      const result = await runSavingsAdviceForCustomer(parsed.data.customerId, {
        selectionAgent: adviceSelectionAgent,
        personalizationAgent: advicePersonalizationAgent,
      });

      return context.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return context.json(
          {
            error: 'Invalid savings advice output',
            details: error.flatten(),
          },
          500
        );
      }

      return context.json(
        {
          error: 'Savings advice failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  },
});
