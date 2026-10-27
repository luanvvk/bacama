import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProductEditor } from '../index';
import { toast } from '@/lib/toast';
import type { AdminProduct } from '@/services/catalog/admin-product';
import { patchProduct } from '@/services/catalog/patch-product';

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

jest.mock('@/lib/toast', () => ({
  toast: Object.assign(jest.fn(), { success: jest.fn(), error: jest.fn() }),
}));
jest.mock('@/services/catalog/patch-product', () => ({ patchProduct: jest.fn() }));

const PRODUCT: AdminProduct = {
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
};

const renderEditor = () => render(<ProductEditor product={PRODUCT} />);

beforeEach(() => jest.mocked(patchProduct).mockResolvedValue(true));
afterEach(() => jest.clearAllMocks());

describe('ProductEditor', () => {
  it('shows the stored roast date as a calendar date', () => {
    renderEditor();

    expect(screen.getByLabelText('Roast date')).toHaveValue('2026-08-11');
  });

  it('sends a PATCH containing only the changed fields', async () => {
    renderEditor();

    const price = screen.getByLabelText('Price · VND');
    await userEvent.clear(price);
    await userEvent.type(price, '199000');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(patchProduct).toHaveBeenCalledWith('p1', { priceVnd: 199000 }));
    expect(toast.success).toHaveBeenCalledWith('Saved Đà Lạt Washed.');
  });

  it('clears the roast date by sending null', async () => {
    renderEditor();

    await userEvent.clear(screen.getByLabelText('Roast date'));
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(patchProduct).toHaveBeenCalledWith('p1', { roastDate: null }));
  });

  it('does not call the API when nothing changed', async () => {
    renderEditor();

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(toast).toHaveBeenCalledWith('No changes to save.'));
    expect(patchProduct).not.toHaveBeenCalled();
  });

  it('rejects a negative price without calling the API', async () => {
    renderEditor();

    const price = screen.getByLabelText('Price · VND');
    await userEvent.clear(price);
    await userEvent.type(price, '-5');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Enter a whole VND amount.')).toBeInTheDocument();
    expect(patchProduct).not.toHaveBeenCalled();
  });

  it('shows an error toast when the save fails', async () => {
    jest.mocked(patchProduct).mockResolvedValue(false);
    renderEditor();

    const stock = screen.getByLabelText('Stock now');
    await userEvent.clear(stock);
    await userEvent.type(stock, '5');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Could not save Đà Lạt Washed. Try again.'),
    );
  });

  it('pauses the listing with an isActive-only PATCH', async () => {
    renderEditor();

    await userEvent.click(screen.getByRole('button', { name: 'Pause listing' }));

    await waitFor(() => expect(patchProduct).toHaveBeenCalledWith('p1', { isActive: false }));
    expect(await screen.findByRole('button', { name: 'Resume listing' })).toBeInTheDocument();
  });
});
