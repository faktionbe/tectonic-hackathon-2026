import { describe, expect, it } from 'vitest';

import type { ProductCategory } from '../src';
import { KBC_PRODUCTS, PRODUCT_CATEGORIES } from '../src';

const EXPECTED_COUNTS: Record<ProductCategory, number> = {
  paying: 11,
  saving: 10,
  investing: 11,
  borrowing: 12,
  insurance: 13,
};

describe('KBC product catalog', () => {
  it('contains 57 products with the expected count in each category', () => {
    expect(KBC_PRODUCTS).toHaveLength(57);

    for (const category of PRODUCT_CATEGORIES) {
      const count = KBC_PRODUCTS.filter(
        (product) => product.category === category
      ).length;

      expect(count).toBe(EXPECTED_COUNTS[category]);
    }
  });

  it('gives every product a unique id and the required text fields', () => {
    const ids = KBC_PRODUCTS.map((product) => product.id);

    expect(new Set(ids).size).toBe(ids.length);

    for (const product of KBC_PRODUCTS) {
      expect(product.id.length).toBeGreaterThan(0);
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.description.length).toBeGreaterThan(0);
      expect(product.relevantFor.length).toBeGreaterThan(0);
      expect(PRODUCT_CATEGORIES).toContain(product.category);
    }
  });
});
