import { describe, expect, it } from 'vitest';

import { expenseAnalysisWorkflow } from '../../src/mastra/workflows/expense-analysis-workflow';
import { savingsAdviceWorkflow } from '../../src/mastra/workflows/savings-advice-workflow';

describe('workflow registration', () => {
  it('builds both customer-id workflows', () => {
    expect(expenseAnalysisWorkflow).toBeDefined();
    expect(savingsAdviceWorkflow).toBeDefined();
  });
});
