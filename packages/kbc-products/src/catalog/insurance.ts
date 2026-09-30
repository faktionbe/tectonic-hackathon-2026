import type { KbcProduct } from '../types';

export const INSURANCE_PRODUCTS: Array<KbcProduct> = [
  {
    id: 'fire-insurance',
    name: 'Fire insurance',
    category: 'insurance',
    description:
      'Covers damage to your home and contents from fire, water damage, storms and more. Tenants cover their liability towards the landlord.',
    relevantFor:
      'Homeowners and tenants (legally required for tenants in Flanders)',
    watchOut: 'Tenants moving often forget it',
  },
  {
    id: 'home-assistance-insurance',
    name: 'Home assistance insurance',
    category: 'insurance',
    description:
      'Emergency help at home, such as a locksmith, plumber or electrician.',
    relevantFor: 'People living alone, seniors, busy families',
    watchOut: null,
  },
  {
    id: 'outstanding-balance-insurance',
    name: 'Outstanding balance insurance',
    category: 'insurance',
    description: 'Repays all or part of your mortgage if a borrower dies.',
    relevantFor: 'Mortgage holders, especially with a partner or children',
    watchOut: 'Coverage should be reviewed at life changes',
  },
  {
    id: 'car-insurance',
    name: 'Car insurance',
    category: 'insurance',
    description:
      'Mandatory liability cover for your car, with optional damage and theft cover. Also for electric cars.',
    relevantFor: 'Car owners',
    watchOut: null,
  },
  {
    id: 'bike-moped-motorbike-insurance',
    name: 'Bike, moped and motorbike insurance',
    category: 'insurance',
    description: 'Cover for theft, damage and assistance for two-wheelers.',
    relevantFor: 'Cyclists (especially e-bikes), scooter and motorbike riders',
    watchOut: null,
  },
  {
    id: 'family-liability',
    name: 'Family liability ("familiale")',
    category: 'insurance',
    description:
      'Covers damage you or your family members accidentally cause to others in private life.',
    relevantFor: 'Households, especially with children or pets, and tenants',
    watchOut: 'Often forgotten by young adults and new households',
  },
  {
    id: 'hospitalization-insurance',
    name: 'Hospitalization insurance',
    category: 'insurance',
    description:
      'Covers hospital costs above what your health insurance fund pays.',
    relevantFor:
      'Everyone, especially self-employed people, families and people without employer cover',
    watchOut: 'Waiting periods and exclusions may apply; add newborns in time',
  },
  {
    id: 'accident-insurance',
    name: 'Accident insurance',
    category: 'insurance',
    description: 'Pays out for injuries from accidents in private life.',
    relevantFor: 'Active people, families, self-employed people',
    watchOut: null,
  },
  {
    id: 'death-insurance',
    name: 'Death insurance',
    category: 'insurance',
    description: 'Pays a fixed amount to your beneficiaries if you die.',
    relevantFor:
      'Parents, people with a partner or dependants, people with debt',
    watchOut: null,
  },
  {
    id: 'funeral-insurance',
    name: 'Funeral insurance',
    category: 'insurance',
    description: 'Pays out a sum to cover funeral costs.',
    relevantFor: 'Seniors and people who want to spare their family the costs',
    watchOut: 'Sensitive timing; never offer right after a loss',
  },
  {
    id: 'life-insurance',
    name: 'Life insurance',
    category: 'insurance',
    description:
      'Combines saving or investing with protection for beneficiaries (Branch 21/23).',
    relevantFor: 'Savers, investors, people planning their estate',
    watchOut: null,
  },
  {
    id: 'travel-insurance',
    name: 'Travel insurance',
    category: 'insurance',
    description:
      'Medical assistance, repatriation and optional cancellation cover abroad.',
    relevantFor: 'Frequent travellers, families on holiday',
    watchOut: null,
  },
  {
    id: 'internet-fraud-insurance',
    name: 'Internet fraud insurance',
    category: 'insurance',
    description: 'Covers financial loss from online fraud and identity theft.',
    relevantFor:
      'Seniors, people less familiar with digital risks, heavy online shoppers',
    watchOut: null,
  },
];
