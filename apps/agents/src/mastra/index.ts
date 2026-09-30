import { chatRoute } from '@mastra/ai-sdk';
import { Mastra } from '@mastra/core/mastra';
import { PostgresStore } from '@mastra/pg';

import { env } from '@/env';

import { agent } from './agents/agent';
import { expenseInsightAgent } from './agents/expense-insight-agent';
import { savingsAdviceAgent } from './agents/savings-advice-agent';
import { expenseAnalysisRoute } from './routes/expense-analysis-route';
import { savingsAdviceRoute } from './routes/savings-advice-route';
import {
  fetchCustomerFinancesTool,
  fetchCustomerProfileTool,
  fetchKbcProductsTool,
} from './tools/customer-data-tools';
import { generateSavingsAdviceTool } from './tools/generate-savings-advice-tool';
import { startScheduleTool, stopScheduleTool } from './tools/schedule-tools';
import {
  computeExpenseMetricsTool,
  fetchExpensesTool,
  fetchPartiesTool,
  fetchSubscriptionsTool,
} from './tools/transaction-data-tools';
import { expenseAnalysisWorkflow } from './workflows/expense-analysis-workflow';
import { savingsAdviceWorkflow } from './workflows/savings-advice-workflow';

export const mastra = new Mastra({
  agents: {
    agent,
    expenseInsightAgent,
    // A2A entry: /api/.well-known/savings-advice-agent/agent-card.json
    // Exec: /api/a2a/savings-advice-agent
    savingsAdviceAgent,
  },
  workflows: { expenseAnalysisWorkflow, savingsAdviceWorkflow },
  tools: {
    startScheduleTool,
    stopScheduleTool,
    fetchCustomerProfileTool,
    fetchCustomerFinancesTool,
    fetchKbcProductsTool,
    generateSavingsAdviceTool,
    fetchExpensesTool,
    fetchPartiesTool,
    fetchSubscriptionsTool,
    computeExpenseMetricsTool,
  },
  storage: new PostgresStore({
    id: 'mastra-storage',
    connectionString: env.DATABASE_URL,
  }),
  server: {
    apiRoutes: [
      expenseAnalysisRoute,
      savingsAdviceRoute,
      chatRoute({
        path: '/chat',
        agent: 'agent',
        version: 'v7',
      }),
    ],
  },
  // observability: new Observability({
  //   configs: {
  //     default: {
  //       serviceName: 'mastra',
  //       exporters: [new MastraStorageExporter(), new MastraPlatformExporter()],
  //       spanOutputProcessors: [new SensitiveDataFilter()],
  //     },
  //   },
  // }),
});
