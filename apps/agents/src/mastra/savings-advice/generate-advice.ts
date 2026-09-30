import type { Agent } from '@mastra/core/agent';
import type { KbcProduct } from '@repo/kbc-products';

import {
  advicePersonalizationBaseSchema,
  adviceSelectionBaseSchema,
  type CustomerProfile,
  type ExistingProductHolding,
  type FinancesInput,
  type SavingsAdviceInput,
  type SavingsAdviceResult,
} from '../schemas/savings-advice';
import { advicePersonalizationSkill } from '../skills/advice-personalization';
import { adviceSelectionSkill } from '../skills/advice-selection';
import {
  customerFinancesToolOutputSchema,
  customerProfileToolOutputSchema,
  kbcProductsToolOutputSchema,
  SAVINGS_SELECTION_TOOL_IDS,
} from '../tools/customer-data-tools';
import {
  assertRequiredToolCalls,
  requireToolResult,
} from '../tools/required-tool-calls';

import { finalizeAdviceSelection, finalizeSavingsAdvice } from './analyze';
import {
  buildPersonalizationPrompt,
  buildSelectionPrompt,
} from './build-context';
import type { SavingsAdviceMetrics } from './metrics';

const SELECTION_MAX_STEPS = 6;
const PERSONALIZATION_MAX_STEPS = 1;

export interface SelectedSavingsAdvice {
  selection: ReturnType<typeof finalizeAdviceSelection>;
  input: SavingsAdviceInput;
  metrics: SavingsAdviceMetrics;
  catalogue: Array<KbcProduct>;
  literacyLevelUsed: CustomerProfile['financialLiteracy'];
}

export async function selectSavingsAdvice(
  customerId: string,
  agent: Agent
): Promise<SelectedSavingsAdvice> {
  const response = await agent.generate(buildSelectionPrompt(customerId), {
    instructions: adviceSelectionSkill.instructions,
    activeTools: [...SAVINGS_SELECTION_TOOL_IDS],
    maxSteps: SELECTION_MAX_STEPS,
    structuredOutput: {
      schema: adviceSelectionBaseSchema,
    },
  });

  const toolResults = assertRequiredToolCalls(response, [
    ...SAVINGS_SELECTION_TOOL_IDS,
  ]);
  const profile = customerProfileToolOutputSchema.parse(
    requireToolResult(toolResults, 'fetch_customer_profile')
  );
  const finances = customerFinancesToolOutputSchema.parse(
    requireToolResult(toolResults, 'fetch_customer_finances')
  );
  const catalogue = kbcProductsToolOutputSchema.parse(
    requireToolResult(toolResults, 'fetch_kbc_products')
  );

  const input = toSavingsAdviceInput(profile, finances.finances);
  const selection = finalizeAdviceSelection(
    response.object,
    catalogue.products.map((product) => product.id)
  );

  return {
    selection,
    input,
    metrics: finances.metrics,
    catalogue: catalogue.products,
    literacyLevelUsed: profile.profile.financialLiteracy,
  };
}

export async function personalizeSavingsAdvice(
  agent: Agent,
  selected: SelectedSavingsAdvice
): Promise<string> {
  const response = await agent.generate(
    buildPersonalizationPrompt({
      input: selected.input,
      metrics: selected.metrics,
      selection: selected.selection,
      catalogue: selected.catalogue,
    }),
    {
      instructions: advicePersonalizationSkill.instructions,
      activeTools: [],
      maxSteps: PERSONALIZATION_MAX_STEPS,
      structuredOutput: {
        schema: advicePersonalizationBaseSchema,
      },
    }
  );

  const personalized = advicePersonalizationBaseSchema.safeParse(
    response.object
  );
  if (
    personalized.success &&
    personalized.data.adviceStatement.trim().length > 0
  ) {
    return personalized.data.adviceStatement;
  }

  return selected.selection.rationale;
}

export async function generateAdvice(
  customerId: string,
  agent: Agent
): Promise<SavingsAdviceResult> {
  const selected = await selectSavingsAdvice(customerId, agent);
  const adviceStatement = await personalizeSavingsAdvice(agent, selected);

  return finalizeSavingsAdvice({
    selection: selected.selection,
    adviceStatement,
    literacyLevelUsed: selected.literacyLevelUsed,
    metrics: selected.metrics,
  });
}

function toSavingsAdviceInput(
  profile: {
    profile: CustomerProfile;
    existingProducts: Array<ExistingProductHolding>;
  },
  finances: FinancesInput
): SavingsAdviceInput {
  return {
    profile: profile.profile,
    existingProducts: profile.existingProducts,
    finances,
  };
}
