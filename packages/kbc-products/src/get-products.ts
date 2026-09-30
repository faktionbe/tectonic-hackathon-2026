import { KBC_PRODUCTS } from './catalog';
import type { KbcProduct, ProductCategory } from './types';
import { PRODUCT_CATEGORIES } from './types';

const CATEGORY_HEADINGS: Record<ProductCategory, string> = {
  paying: 'Paying',
  saving: 'Saving',
  investing: 'Investing',
  borrowing: 'Borrowing',
  insurance: 'Insurance',
};

export function getProducts(
  categories: Array<ProductCategory>
): Array<KbcProduct> {
  if (categories.length === 0) {
    return [];
  }

  const selected = new Set(categories);
  return KBC_PRODUCTS.filter((product) => selected.has(product.category));
}

export function getProductById(id: string): KbcProduct | undefined {
  return KBC_PRODUCTS.find((product) => product.id === id);
}

function formatProduct(product: KbcProduct): string {
  const lines = [
    product.name,
    `What it is: ${product.description}`,
    `Relevant for: ${product.relevantFor}`,
  ];

  if (product.watchOut !== null) {
    lines.push(`Watch out: ${product.watchOut}`);
  }

  return lines.join('\n');
}

export function formatProductsForPrompt(
  categories: Array<ProductCategory>
): string {
  const products = getProducts(categories);
  const sections: Array<string> = [];

  for (const category of PRODUCT_CATEGORIES) {
    const inCategory = products.filter(
      (product) => product.category === category
    );
    if (inCategory.length === 0) {
      continue;
    }

    sections.push(
      `${CATEGORY_HEADINGS[category]}\n\n${inCategory.map(formatProduct).join('\n\n')}`
    );
  }

  return sections.join('\n\n');
}
