import { chatRoute } from '@mastra/ai-sdk';
import { Mastra } from '@mastra/core/mastra';
import { PostgresStore } from '@mastra/pg';

import { env } from '@/env';

import { advicePersonalizationAgent } from './agents/advice-personalization-agent';
import { adviceSelectionAgent } from './agents/advice-selection-agent';
import { agent } from './agents/agent';
import { expenseInsightAgent } from './agents/expense-insight-agent';
import { expenseInsightCopyAgent } from './agents/expense-insight-copy-agent';
import { savingsAdviceAgent } from './agents/savings-advice-agent';
import { expenseAnalysisRoute } from './routes/expense-analysis-route';
import { savingsAdviceRoute } from './routes/savings-advice-route';
import {
  fetchCustomerFinancesTool,
  fetchCustomerProfileTool,
  generateSavingsAdviceTool,
} from './tools/customer-data-tools';
import { startScheduleTool, stopScheduleTool } from './tools/schedule-tools';
import { expenseAnalysisWorkflow } from './workflows/expense-analysis-workflow';
import { savingsAdviceWorkflow } from './workflows/savings-advice-workflow';

export const mastra = new Mastra({
  agents: {
    agent,
    expenseInsightAgent,
    expenseInsightCopyAgent,
    adviceSelectionAgent,
    advicePersonalizationAgent,
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
    generateSavingsAdviceTool,
  },
  server: {
    apiRoutes: [expenseAnalysisRoute, savingsAdviceRoute],
  },
  storage: new PostgresStore({
    id: 'mastra-storage',
    connectionString: env.DATABASE_URL,
  }),
  server: {
    apiRoutes: [
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
