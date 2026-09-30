import { registerApiRoute } from '@mastra/core/server';
import { ZodError } from 'zod';

import { expenseAnalysisRequestSchema } from '../schemas/expense-analysis';
import type { ExpenseAnalysisWithInsights } from '../schemas/financial-insight';

export const expenseAnalysisRoute = registerApiRoute('/expense-analysis', {
  method: 'POST',
  handler: async (context) => {
    let body: unknown;

    try {
      body = await context.req.json();
    } catch {
      return context.json({ error: 'Invalid JSON body' }, 400);
    }

    const parsed = expenseAnalysisRequestSchema.safeParse(body);
    if (!parsed.success) {
      return context.json(
        {
          error: 'Invalid expense analysis input',
          details: parsed.error.flatten(),
        },
        400
      );
    }

    try {
      const mastra = context.get('mastra');
      const workflow = mastra.getWorkflow('expenseAnalysisWorkflow');
      const run = await workflow.createRun();
      const result = await run.start({ inputData: parsed.data });

      if (result.status !== 'success') {
        return context.json(
          {
            error: 'Expense analysis failed',
            details: result,
          },
          500
        );
      }

      return context.json(result.result as ExpenseAnalysisWithInsights);
    } catch (error) {
      if (error instanceof ZodError) {
        return context.json(
          {
            error: 'Invalid expense analysis output',
            details: error.flatten(),
          },
          500
        );
      }

      return context.json(
        {
          error: 'Expense analysis failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  },
});
