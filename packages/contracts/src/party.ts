import { z } from 'zod';

import { expenseCategorySchema } from './expense';

export const partyKindSchema = z.enum(['MERCHANT', 'PERSON']);

export type PartyKind = z.infer<typeof partyKindSchema>;

/**
 * The counterparty of an expense or subscription: either a merchant (business)
 * or a natural person (e.g. a P2P transfer). Referenced by id from
 * `expense.counterpartyId` and `subscription.counterpartyId`.
 */
export const partySchema = z
  .object({
    id: z.string(),
    kind: partyKindSchema,
    name: z
      .string()
      .meta({ description: 'Legal/display name of the merchant or person' }),
    iban: z.string().optional(),
    countryCode: z.string().length(2).optional(),

    category: expenseCategorySchema
      .optional()
      .meta({ description: "Merchant's typical category (merchant only)" }),
    logoUrl: z.url().optional().meta({ description: 'Merchant only' }),
    website: z.url().optional().meta({ description: 'Merchant only' }),
    externalId: z.string().optional().meta({
      description:
        'Normalized merchant key / registry id; groups descriptor variants',
    }),
  })
  .meta({ id: 'Party' });

export type Party = z.infer<typeof partySchema>;
