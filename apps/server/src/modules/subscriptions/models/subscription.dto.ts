import {
  subscriptionListItemSchema,
  subscriptionSchema,
} from '@repo/contracts';
import { z } from 'zod';

import {
  csvToStringArray,
  offsetPaginatedResultSchema,
  offsetPaginationSchema,
} from '@/modules/pagination/pagination.utils';

export const createSubscriptionSchema = subscriptionSchema
  .omit({ id: true })
  .meta({ id: 'CreateSubscriptionRequest' });

export type CreateSubscription = z.infer<typeof createSubscriptionSchema>;

export const updateSubscriptionSchema = createSubscriptionSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  })
  .meta({ id: 'UpdateSubscriptionRequest' });

export type UpdateSubscription = z.infer<typeof updateSubscriptionSchema>;

export const listSubscriptionsQuerySchema = offsetPaginationSchema
  .extend({
    accountIds: csvToStringArray,
  })
  .meta({ id: 'ListSubscriptionsQuery' });

export type ListSubscriptionsQuery = z.infer<
  typeof listSubscriptionsQuerySchema
>;

export const subscriptionsPageSchema = offsetPaginatedResultSchema(
  subscriptionListItemSchema
).meta({ id: 'SubscriptionsPage' });
