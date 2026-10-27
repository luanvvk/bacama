import { render, screen } from '@testing-library/react';

import { LowStockBanner } from '../index';
import type { AdminProduct } from '@/services/catalog/admin-product';

jest.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string, values?: Record<string, string | number>) =>
    `${key}:${JSON.stringify(values ?? {})}`,
}));

const product = (overrides: Partial<AdminProduct>): AdminProduct => ({
  id: 'p1',
  slug: 's',
  name: 'Sơn La Natural',
  category: 'coffee',
  origin: null,
  imageUrl: '',
  priceVnd: 1,
  stock: 6,
  reorderLevel: 10,
  roastDate: '',
  featuredUntil: '',
  isActive: true,
  ...overrides,
});

describe('LowStockBanner', () => {
  it('renders nothing when no active product is at or below its reorder level', async () => {
    const ui = await LowStockBanner({
      products: [product({ stock: 50 }), product({ id: 'p2', stock: 0, isActive: false })],
    });

    expect(ui).toBeNull();
  });

  it('names the low product and links to the catalogue', async () => {
    render(await LowStockBanner({ products: [product({})] }));

    expect(screen.getByText(/^title:.*Sơn La Natural/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /update/ })).toHaveAttribute('href', '/admin/catalog');
  });
});
