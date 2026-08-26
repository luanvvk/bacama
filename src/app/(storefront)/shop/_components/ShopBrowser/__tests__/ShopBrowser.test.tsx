import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ShopBrowser } from '../index';
import { PRODUCTS } from '@/constants/products';

const MESSAGES: Record<string, string> = {
  categoryLabel: 'Category',
  categoryCoffee: 'Coffee',
  categoryGiftSets: 'Gift sets',
  sortLabel: 'Sort by',
  sortFeatured: 'Most recently roasted',
  sortPriceAsc: 'Price: low to high',
  sortPriceDesc: 'Price: high to low',
  noResults: 'No products match those filters.',
};

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { count: number }) =>
    key === 'productsCount' ? `${params?.count} products` : MESSAGES[key],
}));

describe('ShopBrowser', () => {
  it('shows every product by default', () => {
    render(<ShopBrowser />);

    expect(screen.getByText(`${PRODUCTS.length} products`)).toBeInTheDocument();
  });

  it('filters to just the checked category', async () => {
    render(<ShopBrowser />);

    await userEvent.click(screen.getByRole('checkbox', { name: 'Gift sets' }));

    const giftCount = PRODUCTS.filter((product) => product.category === 'gift').length;
    expect(screen.getByText(`${giftCount} products`)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Đà Lạt Washed' })).not.toBeInTheDocument();
  });

  it('shows every product again once the category is unchecked', async () => {
    render(<ShopBrowser />);

    const giftCheckbox = screen.getByRole('checkbox', { name: 'Gift sets' });
    await userEvent.click(giftCheckbox);
    await userEvent.click(giftCheckbox);

    expect(screen.getByText(`${PRODUCTS.length} products`)).toBeInTheDocument();
  });

  it('sorts by price low to high', async () => {
    render(<ShopBrowser />);

    await userEvent.click(screen.getByRole('combobox', { name: 'Sort by' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Price: low to high' }));

    const headings = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent);
    const cheapest = [...PRODUCTS].sort((a, b) => a.priceVnd - b.priceVnd)[0];
    expect(headings[0]).toBe(cheapest.name);
  });
});
