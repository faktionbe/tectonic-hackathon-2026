import { describe, expect, it } from 'vitest';

import { formatProductsForPrompt, getProductById, getProducts } from '../src';

function productBlock(prompt: string, name: string): string | undefined {
  return prompt.split('\n\n').find((block) => block.startsWith(name));
}

describe('getProducts', () => {
  it('returns saving products in catalog order', () => {
    const products = getProducts(['saving']);

    expect(products).toHaveLength(10);
    expect(products.every((product) => product.category === 'saving')).toBe(
      true
    );
    expect(products[0]?.id).toBe('savings-account');
  });

  it('returns mixed categories in catalog order, saving before investing', () => {
    const products = getProducts(['investing', 'saving']);
    const savingCount = products.filter(
      (product) => product.category === 'saving'
    ).length;
    const firstInvestingIndex = products.findIndex(
      (product) => product.category === 'investing'
    );

    expect(products).toHaveLength(21);
    expect(savingCount).toBe(10);
    expect(firstInvestingIndex).toBe(savingCount);
  });

  it('returns nothing for an empty selection and does not duplicate a repeated category', () => {
    expect(getProducts([])).toEqual([]);
    expect(getProducts(['saving', 'saving'])).toHaveLength(10);
  });
});

describe('getProductById', () => {
  it('returns the matching product', () => {
    expect(getProductById('kate')?.name).toBe('Kate');
  });

  it('returns undefined when the id is unknown', () => {
    expect(getProductById('missing')).toBeUndefined();
  });
});

describe('formatProductsForPrompt', () => {
  it('groups paying products and includes a watch-out only when one exists', () => {
    const prompt = formatProductsForPrompt(['paying']);
    const creditCard = productBlock(prompt, 'Credit card');
    const applePay = productBlock(prompt, 'Apple Pay');

    expect(prompt.startsWith('Paying\n\n')).toBe(true);
    expect(creditCard).toContain('What it is:');
    expect(creditCard).toContain('Relevant for:');
    expect(creditCard).toContain(
      'Watch out: Can lead to debt for people with impulsive spending or limited income'
    );
    expect(applePay).toContain('What it is:');
    expect(applePay).toContain('Relevant for:');
    expect(applePay).not.toContain('Watch out:');
  });

  it('returns an empty string when no categories are requested', () => {
    expect(formatProductsForPrompt([])).toBe('');
  });
});
