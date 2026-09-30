import type { KbcProduct } from '../types';

export const SAVING_PRODUCTS: Array<KbcProduct> = [
  {
    id: 'savings-account',
    name: 'Savings account',
    category: 'saving',
    description:
      'Account to set money aside with interest, and accessible at any time.',
    relevantFor: 'Everyone building a buffer or saving for a goal',
    watchOut: 'Interest is modest; not ideal for long-term growth',
  },
  {
    id: 'goal-alert',
    name: 'Goal Alert',
    category: 'saving',
    description:
      'Set savings goals in the app and get reminders and progress updates.',
    relevantFor:
      'People saving for something specific, such as a holiday, a car or a buffer',
    watchOut: null,
  },
  {
    id: 'growth-savings-account',
    name: 'Growth savings account',
    category: 'saving',
    description:
      'Savings account in the name of a child or another person, so you can build up money for them.',
    relevantFor: 'Parents, grandparents, godparents',
    watchOut: 'The money legally belongs to the child',
  },
  {
    id: 'pamperrekening',
    name: 'Pamperrekening',
    category: 'saving',
    description: 'Savings account for a baby or young child.',
    relevantFor: 'New and expecting parents',
    watchOut: 'Check the page for conditions',
  },
  {
    id: 'rental-guarantee-account',
    name: 'Rental guarantee account',
    category: 'saving',
    description:
      "Blocked account where a tenant's deposit is held. Neither landlord nor tenant can withdraw it alone during the lease.",
    relevantFor: 'Tenants signing a new lease',
    watchOut: 'Many tenants still pay the deposit elsewhere or in cash',
  },
  {
    id: 'pension-savings-fund',
    name: 'Pension savings fund',
    category: 'saving',
    description:
      'Long-term saving for your pension in an investment fund, with a yearly tax reduction up to a legal ceiling.',
    relevantFor: 'Working people who pay income tax, from young adults onwards',
    watchOut:
      'Value can go down; taxed later on; not meant to be withdrawn early',
  },
  {
    id: 'pension-savings-insurance',
    name: 'Pension savings insurance',
    category: 'saving',
    description:
      'The same tax benefit, but as an insurance with a guaranteed capital and lower risk.',
    relevantFor: 'Cautious savers who want the tax benefit without fund risk',
    watchOut: 'Lower expected returns than a fund',
  },
  {
    id: 'long-term-saving',
    name: 'Long-term saving',
    category: 'saving',
    description:
      'Tax-supported saving through a life insurance, often combined with or instead of a mortgage tax benefit.',
    relevantFor: 'Taxpayers who have maxed out pension saving, homeowners',
    watchOut: 'Money is locked for a long period',
  },
  {
    id: 'branch-21-savings-insurance',
    name: 'Branch 21 savings insurance',
    category: 'saving',
    description:
      'Insurance with a guaranteed capital and a guaranteed rate, plus a possible profit share.',
    relevantFor:
      'Cautious savers wanting stability and estate planning options',
    watchOut: 'Costs and taxes on early withdrawal',
  },
  {
    id: 'branch-23-investment-insurance',
    name: 'Branch 23 investment insurance',
    category: 'saving',
    description:
      'Insurance whose value follows investment funds. No capital guarantee, but higher potential return.',
    relevantFor:
      'People with a long horizon who accept risk and want estate planning options',
    watchOut: 'Value can drop; not suitable for short-term needs',
  },
];
