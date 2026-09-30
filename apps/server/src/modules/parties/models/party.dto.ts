import { partySchema } from '@repo/contracts';
import { z } from 'zod';

import { offsetPaginatedResultSchema } from '@/modules/pagination/pagination.utils';

export const createPartySchema = partySchema
  .omit({ id: true })
  .meta({ id: 'CreatePartyRequest' });

export type CreateParty = z.infer<typeof createPartySchema>;

export const updatePartySchema = createPartySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  })
  .meta({ id: 'UpdatePartyRequest' });

export type UpdateParty = z.infer<typeof updatePartySchema>;

export const partiesPageSchema = offsetPaginatedResultSchema(partySchema).meta({
  id: 'PartiesPage',
});
