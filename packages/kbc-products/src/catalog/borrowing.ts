import type { KbcProduct } from '../types';

export const BORROWING_PRODUCTS: Array<KbcProduct> = [
  {
    id: 'mortgage',
    name: 'Mortgage',
    category: 'borrowing',
    description:
      'Long-term loan to buy, build or renovate a home, secured by the property.',
    relevantFor:
      'First-time buyers, couples buying together, people moving to a bigger home',
    watchOut: 'Hard to get with irregular or starting self-employed income',
  },
  {
    id: 'bridging-loan',
    name: 'Bridging loan',
    category: 'borrowing',
    description:
      'Short-term loan to buy a new home before the old one is sold.',
    relevantFor: 'Homeowners moving to a new house',
    watchOut: 'Risk if the old home sells late or for less',
  },
  {
    id: 'renovation-loan',
    name: 'Renovation loan',
    category: 'borrowing',
    description: 'Loan for renovation works.',
    relevantFor: 'Homeowners renovating',
    watchOut: null,
  },
  {
    id: 'energy-loan',
    name: 'Energy loan',
    category: 'borrowing',
    description:
      'Loan for energy-saving works like insulation, solar panels or a heat pump.',
    relevantFor: 'Homeowners making their home more sustainable',
    watchOut: null,
  },
  {
    id: 'interior-loan',
    name: 'Interior loan',
    category: 'borrowing',
    description: 'Loan to furnish a home.',
    relevantFor: 'People who just moved or are setting up a household',
    watchOut: 'Can finance impulse purchases',
  },
  {
    id: 'garden-and-terrace-loan',
    name: 'Garden and terrace loan',
    category: 'borrowing',
    description: 'Loan for outdoor works.',
    relevantFor: 'Homeowners with a garden project',
    watchOut: null,
  },
  {
    id: 'car-loan',
    name: 'Car loan',
    category: 'borrowing',
    description:
      'Instalment loan for a petrol, diesel, hybrid or electric car.',
    relevantFor: 'People buying a car, new or used',
    watchOut: null,
  },
  {
    id: 'two-wheeler-loan',
    name: 'Two-wheeler loan',
    category: 'borrowing',
    description: 'Loan for a bike, e-bike, scooter or motorbike.',
    relevantFor: 'Commuters and cyclists',
    watchOut: null,
  },
  {
    id: 'camper-caravan-boat-loan',
    name: 'Camper, caravan or boat loan',
    category: 'borrowing',
    description: 'Loan for recreational vehicles.',
    relevantFor: 'Leisure-focused households',
    watchOut: 'Discretionary spending',
  },
  {
    id: 'autolening-plus',
    name: 'Autolening Plus',
    category: 'borrowing',
    description: 'Car loan with extra features compared to the standard loan.',
    relevantFor: 'Car buyers',
    watchOut: 'Check the page for details',
  },
  {
    id: 'personal-loan',
    name: 'Personal loan',
    category: 'borrowing',
    description:
      'Instalment loan for smaller purposes like studies, holidays or appliances.',
    relevantFor: 'People with a stable income and a clear purpose',
    watchOut: 'Not suitable for people in financial distress',
  },
  {
    id: 'kbc-flex-budget',
    name: 'KBC Flex Budget',
    category: 'borrowing',
    description:
      'Spread repayment of credit card spending over several months, with interest.',
    relevantFor: 'People who want flexibility on a larger purchase',
    watchOut: 'Easily becomes a debt spiral; never for vulnerable customers',
  },
];
