import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProductsBrowser } from '../index';
import type { AdminProduct } from '@/services/catalog/admin-product';

jest.mock('next-intl', () => {
  const messages = jest.requireActual<Record<string, unknown>>('../../../../../messages/en.json');
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

const product = (overrides: Partial<AdminProduct>): AdminProduct => ({
  id: 'p1',
  slug: 'dalat-washed',
  name: 'Đà Lạt Washed',
  category: 'coffee',
  origin: 'Đà Lạt',
  imageUrl: 'https://example.com/a.jpg',
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
  product({ id: 'p2', slug: 'sonla', name: 'Sơn La Natural', origin: 'Sơn La', stock: 6 }),
  product({ id: 'p3', slug: 'paused', name: 'Paused Blend', origin: null, isActive: false }),
];

const renderBrowser = (nextCursor: string | null = null) =>
  render(<ProductsBrowser products={PRODUCTS} nextCursor={nextCursor} />);

const rowOf = (name: string) => screen.getByText(name).closest('tr') as HTMLElement;

describe('ProductsBrowser', () => {
  it('hides Load more when there is no next page', () => {
    renderBrowser();

    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  it('appends the next page and hides Load more on the last page', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [product({ id: 'p4', slug: 'late', name: 'Late Arrival' })],
        nextCursor: null,
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    renderBrowser('p3');

    await userEvent.click(screen.getByRole('button', { name: 'Load more' }));

    expect(await screen.findByText('Late Arrival')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/products?cursor=p3');
    expect(screen.getByText('Sơn La Natural')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  it('lists database products with stock, roast date and status', () => {
    renderBrowser();

    expect(within(rowOf('Sơn La Natural')).getByText('6')).toBeInTheDocument();
    expect(within(rowOf('Sơn La Natural')).getByText('2026-08-11')).toBeInTheDocument();
    expect(within(rowOf('Sơn La Natural')).getByText('Low')).toBeInTheDocument();
    expect(within(rowOf('Paused Blend')).getByText('Paused')).toBeInTheDocument();
  });

  it('filters by search text and by low status', async () => {
    renderBrowser();

    await userEvent.type(screen.getByLabelText('Search catalogue'), 'sơn');
    expect(screen.queryByText('Đà Lạt Washed')).not.toBeInTheDocument();
    expect(screen.getByText('Sơn La Natural')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('Search catalogue'));
    await userEvent.click(screen.getByRole('button', { name: 'Low' }));
    expect(screen.getByText('Sơn La Natural')).toBeInTheDocument();
    expect(screen.queryByText('Đà Lạt Washed')).not.toBeInTheDocument();
  });

  it('renders unbuilt controls disabled with a visible label', () => {
    renderBrowser();

    expect(screen.getByRole('button', { name: 'Import CSV' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '+ New product' })).toBeDisabled();
    expect(screen.getByText('Not available yet')).toBeInTheDocument();
  });

  it('links each row to its edit page', () => {
    renderBrowser();

    expect(within(rowOf('Đà Lạt Washed')).getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/admin/catalog/dalat-washed/edit',
    );
  });
});
