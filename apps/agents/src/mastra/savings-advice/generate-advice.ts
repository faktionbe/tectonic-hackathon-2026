import type { Agent } from '@mastra/core/agent';

import {
  advicePersonalizationBaseSchema,
  adviceSelectionBaseSchema,
  type SavingsAdviceInput,
  type SavingsAdviceResult,
} from '../schemas/savings-advice';

import {
  finalizeAdviceSelection,
  finalizeSavingsAdvice,
  prepareSavingsAdvice,
} from './analyze';
import { buildPersonalizationPrompt } from './build-context';

export interface SavingsAdviceAgents {
  selectionAgent: Agent;
  personalizationAgent: Agent;
}

export async function generateAdvice(
  input: SavingsAdviceInput,
  agents: SavingsAdviceAgents
): Promise<SavingsAdviceResult> {
  const { context } = prepareSavingsAdvice(input);

  const selectionResponse = await agents.selectionAgent.generate(
    context.selectionPrompt,
    {
      structuredOutput: {
        schema: adviceSelectionBaseSchema,
      },
    }
  );

  const selection = finalizeAdviceSelection(
    selectionResponse.object,
    context.catalogueIds
  );

  const personalizationPrompt = buildPersonalizationPrompt({
    input: context.input,
    metrics: context.metrics,
    selection,
    catalogue: context.catalogue,
  });

  const personalizationResponse = await agents.personalizationAgent.generate(
    personalizationPrompt,
    {
      structuredOutput: {
        schema: advicePersonalizationBaseSchema,
      },
    }
  );

  const personalized = advicePersonalizationBaseSchema.safeParse(
    personalizationResponse.object
  );
  const adviceStatement =
    personalized.success && personalized.data.adviceStatement.trim().length > 0
      ? personalized.data.adviceStatement
      : selection.rationale;

  return finalizeSavingsAdvice({
    selection,
    adviceStatement,
    literacyLevelUsed: input.profile.financialLiteracy,
    metrics: context.metrics,
  });
}
