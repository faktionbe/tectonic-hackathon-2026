import type { KbcProduct } from '../types';

export const PAYING_PRODUCTS: Array<KbcProduct> = [
  {
    id: 'current-account',
    name: 'Current account',
    category: 'paying',
    description:
      'The basic account where your income arrives and your daily payments, cards and direct debits run from. Comes with KBC Mobile and Touch.',
    relevantFor: 'Everyone with an income or regular expenses',
    watchOut: 'Separate account needed for business activity',
  },
  {
    id: 'youth-account',
    name: 'Youth account',
    category: 'paying',
    description:
      'A current account adapted to young customers, with limits and parental involvement depending on age.',
    relevantFor: 'Children, teenagers, students',
    watchOut: 'Parents often need to co-sign for minors',
  },
  {
    id: 'debit-card',
    name: 'Debit card',
    category: 'paying',
    description:
      'Card linked to your current account for in-store, online and contactless payments and cash withdrawals. Money leaves your account immediately. Optionally with your own photo.',
    relevantFor: 'Everyone',
    watchOut: null,
  },
  {
    id: 'credit-card',
    name: 'Credit card',
    category: 'paying',
    description:
      'Card that lets you pay now and settle later, usually once a month. Includes extra insurance on purchases and travel.',
    relevantFor:
      'Frequent travellers, online shoppers, people who want purchase protection or need a card for car rentals and hotels',
    watchOut:
      'Can lead to debt for people with impulsive spending or limited income',
  },
  {
    id: 'overdraft',
    name: 'Overdraft ("onder nul gaan")',
    category: 'paying',
    description:
      'An agreed limit that lets your account go below zero temporarily. You pay interest on the negative balance.',
    relevantFor:
      'People with occasional short-term cash gaps, such as between big bills and payday',
    watchOut:
      'Expensive if used structurally; a warning sign when someone is always in the red',
  },
  {
    id: 'cash',
    name: 'Cash',
    category: 'paying',
    description: 'Withdrawing and depositing cash at ATMs and branches.',
    relevantFor:
      'People who still pay in cash, often older customers and small traders',
    watchOut:
      'Rising cash withdrawals can signal confusion or fraud pressure among vulnerable customers',
  },
  {
    id: 'kbc-mobile-touch',
    name: 'KBC Mobile / KBC Touch',
    category: 'paying',
    description:
      'The banking app and the web version: payments, overviews, product applications, insurance, and extra non-banking services.',
    relevantFor: 'Everyone who banks digitally',
    watchOut: 'Older or less digital customers may need a simpler mode',
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    category: 'paying',
    description:
      'Pay contactless with an iPhone, Apple Watch or Mac using your KBC card.',
    relevantFor: 'iPhone users who prefer phone payments',
    watchOut: null,
  },
  {
    id: 'wero',
    name: 'Wero',
    category: 'paying',
    description:
      'Pay friends using just their phone number, and pay in shops and online with a QR code.',
    relevantFor:
      'People who split costs with friends or pay small amounts often',
    watchOut: null,
  },
  {
    id: 'group-expenses',
    name: 'Group expenses tool',
    category: 'paying',
    description:
      'Track shared costs in a group and see who owes what. Non-KBC customers can join.',
    relevantFor: 'Couples, roommates, friends on holiday',
    watchOut: null,
  },
  {
    id: 'kate',
    name: 'Kate',
    category: 'paying',
    description:
      "KBC's digital assistant for questions and simple tasks in the app.",
    relevantFor:
      'Digital-first customers, and people who avoid calling the bank',
    watchOut: null,
  },
];
