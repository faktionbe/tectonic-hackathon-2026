import type { KbcProduct } from '../types';

import { BORROWING_PRODUCTS } from './borrowing';
import { INSURANCE_PRODUCTS } from './insurance';
import { INVESTING_PRODUCTS } from './investing';
import { PAYING_PRODUCTS } from './paying';
import { SAVING_PRODUCTS } from './saving';

export const KBC_PRODUCTS: Array<KbcProduct> = [
  ...PAYING_PRODUCTS,
  ...SAVING_PRODUCTS,
  ...INVESTING_PRODUCTS,
  ...BORROWING_PRODUCTS,
  ...INSURANCE_PRODUCTS,
];
