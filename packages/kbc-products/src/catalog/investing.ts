import type { KbcProduct } from '../types';

export const INVESTING_PRODUCTS: Array<KbcProduct> = [
  {
    id: 'fund-finder',
    name: 'Fund finder',
    category: 'investing',
    description:
      'Tool to search and compare investment funds by risk, theme and returns.',
    relevantFor: 'Customers who want to choose investments themselves',
    watchOut: null,
  },
  {
    id: 'delegated-investing',
    name: 'Delegated investing',
    category: 'investing',
    description: 'KBC manages your investments based on your profile.',
    relevantFor: 'People who want to invest but lack time or knowledge',
    watchOut: 'Management fees',
  },
  {
    id: 'bolero',
    name: 'Bolero',
    category: 'investing',
    description:
      'Online platform for buying and selling shares, ETFs and bonds yourself.',
    relevantFor: 'Experienced and self-directed investors',
    watchOut:
      'Frequent trading can become impulsive; not for vulnerable customers',
  },
  {
    id: 'thematic-investing',
    name: 'Thematic investing',
    category: 'investing',
    description:
      'Funds focused on themes like technology, healthcare or climate.',
    relevantFor: 'Investors with a specific interest or conviction',
    watchOut: 'Concentrated risk',
  },
  {
    id: 'responsible-investing',
    name: 'Responsible investing',
    category: 'investing',
    description: 'Funds screened on sustainability and ethics.',
    relevantFor: 'Investors who want their money to reflect their values',
    watchOut: null,
  },
  {
    id: 'kbc-investment-plan',
    name: 'KBC investment plan',
    category: 'investing',
    description: 'Invest a fixed amount every month in funds.',
    relevantFor: 'Beginners and people who want to invest gradually',
    watchOut: 'Still carries market risk',
  },
  {
    id: 'investing-for-a-child',
    name: 'Investing for a child',
    category: 'investing',
    description: 'Long-term investing in the name of or for a child.',
    relevantFor: 'Parents and grandparents with a long horizon',
    watchOut: 'Money belongs to the child',
  },
  {
    id: 'investing-with-spare-change',
    name: 'Investing with spare change',
    category: 'investing',
    description: 'Payments are rounded up and the difference is invested.',
    relevantFor: 'Beginners and young adults',
    watchOut: 'Small amounts; still market risk',
  },
  {
    id: 'learning-content',
    name: 'Learning content',
    category: 'investing',
    description: 'Articles and guides on how investing works.',
    relevantFor: 'Beginners, people with low financial literacy',
    watchOut: null,
  },
  {
    id: 'private-banking',
    name: 'Private Banking',
    category: 'investing',
    description: 'Personal wealth management with a dedicated banker.',
    relevantFor: 'Customers with large assets, heirs, business owners',
    watchOut: 'Only relevant once assets are clear and stable',
  },
  {
    id: 'cera-shares',
    name: 'Cera shares',
    category: 'investing',
    description: "Cooperative shares in Cera, KBC's cooperative shareholder.",
    relevantFor: 'Long-time KBC customers interested in cooperative membership',
    watchOut: null,
  },
];
