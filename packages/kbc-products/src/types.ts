export const PRODUCT_CATEGORIES = [
  'paying',
  'saving',
  'investing',
  'borrowing',
  'insurance',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface KbcProduct {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  relevantFor: string;
  watchOut: string | null;
}
