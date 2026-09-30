import { z } from 'zod';

import { accountSchema } from './account';
import { creditCardSchema } from './credit-card';
import { financialHolderSchema } from './financial-holder';
import { insuranceSchema } from './insurance';
import { investmentSchema } from './investment';
import { loanSchema } from './loan';
import { profileSchema } from './profile';

/** Insurance record plus this holder's coverage share. */
export const profileHolderCoverageSchema = insuranceSchema
  .extend({
    coveragePercentage: z.number().min(0).max(100).nullable(),
  })
  .meta({ id: 'ProfileHolderCoverage' });

export type ProfileHolderCoverage = z.infer<typeof profileHolderCoverageSchema>;

/**
 * Financial holder and every product linked through it:
 * accounts, loans, credit cards, investments, policies held, and coverages.
 */
export const profileFinancialPositionSchema = financialHolderSchema
  .extend({
    accounts: z.array(accountSchema),
    loans: z.array(loanSchema),
    creditCards: z.array(creditCardSchema),
    investments: z.array(investmentSchema),
    insurancePolicies: z.array(insuranceSchema),
    insuranceCoverages: z.array(profileHolderCoverageSchema),
  })
  .meta({ id: 'ProfileFinancialPosition' });

export type ProfileFinancialPosition = z.infer<
  typeof profileFinancialPositionSchema
>;

/** Profile plus its financial holder, when one is linked. */
export const profileListItemSchema = profileSchema
  .extend({
    financialHolder: financialHolderSchema.nullable(),
  })
  .meta({ id: 'ProfileListItem' });

export type ProfileListItem = z.infer<typeof profileListItemSchema>;

/** Profile plus the holder's accounts and other financial products. */
export const profileDetailSchema = profileSchema
  .extend({
    financialHolder: profileFinancialPositionSchema.nullable(),
  })
  .meta({ id: 'ProfileDetail' });

export type ProfileDetail = z.infer<typeof profileDetailSchema>;
