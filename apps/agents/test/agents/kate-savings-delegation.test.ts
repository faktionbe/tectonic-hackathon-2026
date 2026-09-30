import { RequestContext } from '@mastra/core/request-context';
import { describe, expect, it } from 'vitest';

import { env } from '@/env';

import {
  agent,
  buildKateInstructions,
  onSavingsAdviceDelegationStart,
} from '../../src/mastra/agents/agent';
import { SAVINGS_ADVICE_AGENT_ID } from '../../src/mastra/agents/savings-advice-a2a';
import { appendCustomerId, readProfileId } from '../../src/mastra/profile-id';

describe('Kate savings advice delegation', () => {
  it('registers the savings advice agent as an A2A subagent', async () => {
    const subagents = await agent.listAgents();
    const savingsAgent = subagents[SAVINGS_ADVICE_AGENT_ID];

    expect(savingsAgent).toBeDefined();
    expect(savingsAgent?.id).toBe(SAVINGS_ADVICE_AGENT_ID);
    expect(savingsAgent?.getDescription()).toContain('customerId');
  });

  it('uses requestContext.profileId and falls back to the dummy id', () => {
    expect(readProfileId(undefined)).toBe(env.DEFAULT_PROFILE_ID);
    expect(readProfileId({})).toBe(env.DEFAULT_PROFILE_ID);
    expect(readProfileId({ profileId: '  ' })).toBe(env.DEFAULT_PROFILE_ID);
    expect(readProfileId({ profileId: 'profile-from-body' })).toBe(
      'profile-from-body'
    );

    const requestContext = new RequestContext();
    requestContext.set('profileId', 'profile-from-context');
    expect(readProfileId(requestContext)).toBe('profile-from-context');
  });

  it('appends the profile id when delegating to savings advice', () => {
    const other = onSavingsAdviceDelegationStart({
      primitiveId: 'other-agent',
      prompt: 'hello',
      requestContext: { profileId: 'profile-1' },
    });
    expect(other).toEqual({ proceed: true });

    const delegated = onSavingsAdviceDelegationStart({
      primitiveId: SAVINGS_ADVICE_AGENT_ID,
      prompt: 'What is the best savings for me?',
      requestContext: { profileId: 'profile-1' },
    });
    expect(delegated.modifiedPrompt).toBe(
      appendCustomerId('What is the best savings for me?', 'profile-1')
    );
    expect(delegated.modifiedPrompt).toContain('customerId: profile-1');

    const fallback = onSavingsAdviceDelegationStart({
      primitiveId: SAVINGS_ADVICE_AGENT_ID,
      prompt: 'What is the best savings for me?',
      requestContext: undefined,
    });
    expect(fallback.modifiedPrompt).toContain(
      `customerId: ${env.DEFAULT_PROFILE_ID}`
    );
  });

  it('tells Kate to delegate personalized savings advice for the profile id', async () => {
    const requestContext = new RequestContext();
    requestContext.set('profileId', 'profile-9');
    const instructions = await agent.getInstructions({ requestContext });

    expect(instructions).toBe(buildKateInstructions('profile-9'));
    expect(instructions).toContain(SAVINGS_ADVICE_AGENT_ID);
    expect(instructions).toContain('customerId profile-9');
    expect(instructions).not.toContain(
      'Do not give personalized savings or investment advice'
    );
  });
});
