import { z } from 'zod';

export const insuranceKindSchema = z.enum([
  'FIRE',
  'FAMILY_LIABILITY',
  'HOSPITALIZATION',
  'OUTSTANDING_BALANCE',
  'INCOME_PROTECTION',
  'LIFE',
  'CAR',
  'OTHER',
]);

export type InsuranceKind = z.infer<typeof insuranceKindSchema>;

export const insuredPersonSchema = z
  .object({
    holderId: z.string(),
    coveragePercentage: z.number().min(0).max(100).nullable(),
  })
  .meta({ id: 'InsuredPerson' });

export type InsuredPerson = z.infer<typeof insuredPersonSchema>;

export const insuranceSchema = z
  .object({
    id: z.string(),
    policyholderIds: z.array(z.string()),
    providerName: z.string().nullable(),
    productName: z.string().nullable(),
    kind: insuranceKindSchema.nullable(),
    isEmployerProvided: z.boolean().nullable(),
    loanId: z.string().nullable(),
    insuredPersons: z.array(insuredPersonSchema),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: 'Insurance' });

export type Insurance = z.infer<typeof insuranceSchema>;
