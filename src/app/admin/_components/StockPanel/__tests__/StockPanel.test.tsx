import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StockPanel } from '../index';
import { toast } from '@/lib/toast';
import type { AdminProduct } from '@/services/catalog/admin-product';
import { patchProduct } from '@/services/catalog/patch-product';

jest.mock('next-intl', () => {
  const messages = jest.requireActual<Record<string, unknown>>(
    '../../../../../../messages/en.json',
  );
  return {
    useTranslations: (namespace: string) => (key: string, values?: Record<string, string>) => {
      const template = [...namespace.split('.'), key].reduce<unknown>(
        (node, part) => (node as Record<string, unknown> | undefined)?.[part],
        messages as unknown,
      ) as string;
      return Object.entries(values ?? {}).reduce(
        (text, [name, value]) => text.replace(`{${name}}`, value),
        template,
      );
    },
  };
});

jest.mock('@/lib/toast', () => ({
  toast: Object.assign(jest.fn(), { success: jest.fn(), error: jest.fn() }),
}));
jest.mock('@/services/catalog/patch-product', () => ({ patchProduct: jest.fn() }));

const product = (overrides: Partial<AdminProduct>): AdminProduct => ({
  id: 'p1',
  slug: 'dalat-washed',
  name: 'Đà Lạt Washed',
  category: 'coffee',
  origin: null,
  imageUrl: 'https://images.unsplash.com/a.jpg',
  priceVnd: 185000,
  stock: 42,
  reorderLevel: 10,
  roastDate: '2026-08-11',
  featuredUntil: '',
  isActive: true,
  ...overrides,
});

const PRODUCTS = [
  product({}),
  product({ id: 'p2', slug: 'sonla', name: 'Sơn La Natural', stock: 6 }),
  product({ id: 'p3', slug: 'hidden', name: 'Hidden Blend', isActive: false }),
];

const renderPanel = () => render(<StockPanel products={PRODUCTS} />);

beforeEach(() => jest.mocked(patchProduct).mockResolvedValue(true));
afterEach(() => jest.clearAllMocks());

describe('StockPanel', () => {
  it('renders each active product with its current quantity and roast date', () => {
    renderPanel();

    expect(screen.getByLabelText('Đà Lạt Washed stock')).toHaveValue(42);
    expect(screen.getByLabelText('Sơn La Natural stock')).toHaveValue(6);
    expect(screen.queryByLabelText('Hidden Blend stock')).not.toBeInTheDocument();
    expect(screen.getAllByText('roasted 2026-08-11')).toHaveLength(2);
  });

  it('patches only the changed product with only the stock field', async () => {
    renderPanel();

    const input = screen.getByLabelText('Sơn La Natural stock');
    await userEvent.clear(input);
    await userEvent.type(input, '50');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Stock updated.'));
    expect(patchProduct).toHaveBeenCalledTimes(1);
    expect(patchProduct).toHaveBeenCalledWith('p2', { stock: 50 });
  });

  it('does not call the API when nothing changed', async () => {
    renderPanel();

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(patchProduct).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith('No changes to save.');
  });

  it('shows an error toast when the save fails', async () => {
    jest.mocked(patchProduct).mockResolvedValue(false);
    renderPanel();

    const input = screen.getByLabelText('Đà Lạt Washed stock');
    await userEvent.clear(input);
    await userEvent.type(input, '3');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.success).not.toHaveBeenCalled();
  });
});
