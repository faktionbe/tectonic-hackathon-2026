import { describe, expect, it } from 'vitest';

import {
  assertRequiredToolCalls,
  MissingToolCallsError,
} from '../../src/mastra/tools/required-tool-calls';

describe('assertRequiredToolCalls', () => {
  it('returns tool results when every required tool was called', () => {
    const results = assertRequiredToolCalls(
      {
        toolCalls: [
          { payload: { toolName: 'fetch_expenses' } },
          { toolName: 'fetch_parties' },
        ],
        toolResults: [
          {
            type: 'tool-result',
            payload: {
              toolName: 'fetch_expenses',
              result: { expenses: [{ id: 'tx_1' }] },
            },
          },
          {
            toolName: 'fetch_parties',
            result: { parties: [] },
          },
        ],
      },
      ['fetch_expenses', 'fetch_parties']
    );

    expect(results.get('fetch_expenses')).toEqual({
      expenses: [{ id: 'tx_1' }],
    });
    expect(results.get('fetch_parties')).toEqual({ parties: [] });
  });

  it('reads tool results nested on steps', () => {
    const results = assertRequiredToolCalls(
      {
        steps: [
          {
            toolResults: [
              {
                payload: {
                  toolName: 'fetch_customer_profile',
                  result: { profile: { financialLiteracy: 'beginner' } },
                },
              },
            ],
          },
        ],
      },
      ['fetch_customer_profile']
    );

    expect(results.get('fetch_customer_profile')).toEqual({
      profile: { financialLiteracy: 'beginner' },
    });
  });

  it('throws the missing tool ids when a required tool was not called', () => {
    expect.assertions(2);

    try {
      assertRequiredToolCalls(
        {
          toolCalls: [{ payload: { toolName: 'fetch_expenses' } }],
          toolResults: [
            {
              payload: { toolName: 'fetch_expenses', result: { expenses: [] } },
            },
          ],
        },
        ['fetch_expenses', 'fetch_parties', 'compute_expense_metrics']
      );
    } catch (error) {
      expect(error).toBeInstanceOf(MissingToolCallsError);
      if (error instanceof MissingToolCallsError) {
        expect(error.missing).toEqual([
          'fetch_parties',
          'compute_expense_metrics',
        ]);
      }
    }
  });
});
