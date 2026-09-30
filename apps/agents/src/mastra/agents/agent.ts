import { Agent, type DelegationStartResult } from '@mastra/core/agent';
import { TaskSignalProvider } from '@mastra/core/signals';
import { askUserTool, webFetchTool } from '@mastra/core/tools';
import {
  LocalFilesystem,
  LocalSandbox,
  Workspace,
  WORKSPACE_TOOLS,
} from '@mastra/core/workspace';
import { Memory } from '@mastra/memory';
import {
  formatProductsForPrompt,
  PRODUCT_CATEGORIES,
} from '@repo/kbc-products';

import { appendCustomerId, readProfileId } from '../profile-id';
import { startScheduleTool, stopScheduleTool } from '../tools/schedule-tools';

import {
  SAVINGS_ADVICE_AGENT_ID,
  savingsAdviceA2AAgent,
} from './savings-advice-a2a';

const workspacePath = 'workspace';

const workspace = new Workspace({
  id: 'agent-workspace',
  name: 'Agent Workspace',
  filesystem: new LocalFilesystem({
    basePath: workspacePath,
  }),
  sandbox: new LocalSandbox({
    workingDirectory: workspacePath,
  }),
  tools: {
    [WORKSPACE_TOOLS.FILESYSTEM.WRITE_FILE]: {
      requireReadBeforeWrite: true,
    },
    [WORKSPACE_TOOLS.FILESYSTEM.EDIT_FILE]: {
      requireReadBeforeWrite: true,
    },
    [WORKSPACE_TOOLS.FILESYSTEM.DELETE]: {
      requireApproval: true,
    },
  },
});

const suggestedPrompts = [
  "What's the difference between a current account and a savings account?",
  'What should I watch out for with a credit card or an overdraft?',
  'Which KBC product fits a short-term cash buffer?',
];

export function buildKateInstructions(profileId: string): string {
  return `You are Kate, KBC's digital assistant in the banking app. Help with paying, saving, investing, borrowing, and insurance in plain language. Reply in the user's language. When they write in English, answer in English. Keep answers short. When the goal is unclear, ask one clarifying question. When they greet you without a task, invite them to ask about everyday accounts, cards, or a short-term cash buffer.

Explain products using only the catalogue below. Match a product to a stated situation using its "Relevant for" and "Watch out" lines. Mention KBC Mobile / KBC Touch, cards, Wero, and everyday accounts when they fit. Use EUR for amounts.

Do not invent balances, rates, fees, approvals, holdings, or returns. Do not execute payments, transfers, card blocks, or product applications. Do not guarantee returns. When the customer asks for personalized savings or investment advice, such as the best way for them to save, delegate to the ${SAVINGS_ADVICE_AGENT_ID} subagent, pass customerId ${profileId}, and relay the subagent's advice. Do not diagnose financial stress or life events. For fraud, a lost card, or a complaint, tell the customer to contact KBC through the app or a branch. Stay on KBC retail products.

The signed-in customer's profile id is ${profileId}.

Do not use the workspace, shell, web fetch, or schedules unless the customer explicitly asks to save a note or look up a public page. Never use them to demo weather, stocks, or web pages.

Product catalogue:

${formatProductsForPrompt([...PRODUCT_CATEGORIES])}`;
}

export function onSavingsAdviceDelegationStart(context: {
  primitiveId: string;
  prompt: string;
  requestContext: unknown;
}): DelegationStartResult {
  if (context.primitiveId !== SAVINGS_ADVICE_AGENT_ID) {
    return { proceed: true };
  }

  return {
    proceed: true,
    modifiedPrompt: appendCustomerId(
      context.prompt,
      readProfileId(context.requestContext)
    ),
  };
}

export const agent = new Agent({
  id: 'agent',
  name: 'Kate',
  description:
    "KBC's digital assistant for everyday banking questions and simple product guidance in the app.",
  metadata: {
    suggestedPrompts,
  },
  instructions: ({ requestContext }) =>
    buildKateInstructions(readProfileId(requestContext)),
  model: 'openrouter/openai/gpt-5.6-terra',
  agents: {
    [SAVINGS_ADVICE_AGENT_ID]: savingsAdviceA2AAgent,
  },
  defaultOptions: {
    maxSteps: 100,
    autoResumeSuspendedTools: true,
    delegation: {
      onDelegationStart: onSavingsAdviceDelegationStart,
    },
  },
  memory: new Memory({
    options: {
      generateTitle: true,
      observationalMemory: {
        model: 'openrouter/openai/gpt-5-mini',
      },
    },
  }),
  workspace,
  tools: {
    ask_user: askUserTool,
    start_schedule: startScheduleTool,
    stop_schedule: stopScheduleTool,
    web_fetch: webFetchTool,
  },
  signals: [new TaskSignalProvider()],
});
