import { expenseListItemSchema, expenseSchema } from '@repo/contracts';
import { z } from 'zod';

import {
  csvToStringArray,
  offsetPaginatedResultSchema,
  offsetPaginationSchema,
} from '@/modules/pagination/pagination.utils';

export const createExpenseSchema = expenseSchema
  .omit({ id: true })
  .meta({ id: 'CreateExpenseRequest' });

export type CreateExpense = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  })
  .meta({ id: 'UpdateExpenseRequest' });

export type UpdateExpense = z.infer<typeof updateExpenseSchema>;

export const listExpensesQuerySchema = offsetPaginationSchema
  .extend({
    accountIds: csvToStringArray,
    bookingDateFrom: z.iso.date().optional(),
    bookingDateTo: z.iso.date().optional(),
  })
  .meta({ id: 'ListExpensesQuery' });

export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;

export const expensesPageSchema = offsetPaginatedResultSchema(
  expenseListItemSchema
).meta({ id: 'ExpensesPage' });
