import { Mastra } from '@mastra/core/mastra';
import { PostgresStore } from '@mastra/pg';

import { env } from '@/env';

import { agent } from './agents/agent';
import { startScheduleTool, stopScheduleTool } from './tools/schedule-tools';

export const mastra = new Mastra({
  agents: { agent },
  tools: { startScheduleTool, stopScheduleTool },
  storage: new PostgresStore({
    id: 'mastra-storage',
    connectionString: env.DATABASE_URL,
  }),
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
