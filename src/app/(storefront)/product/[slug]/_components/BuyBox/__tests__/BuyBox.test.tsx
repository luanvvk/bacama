import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BuyBox } from '../index';
import { PRODUCTS } from '@/constants/products';
import { useCartStore } from '@/stores/cart';

const MESSAGES: Record<string, string> = {
  weightLabel: 'Weight',
  grindLabel: 'Grind for',
  addToCart: 'Add to cart',
  buyNowZalopay: 'Buy now with ZaloPay',
  assuranceRoasted: 'Roasted, then posted. Ships within 24 hours of the batch.',
  assuranceShipping: 'GHN nationwide in 2–3 days. Free over 500,000 ₫.',
  assuranceCod: 'Cash on delivery available nationwide.',
  assurancePickup: 'Or collect at a café within 2 hours.',
};

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => MESSAGES[key],
}));

const dalatWashed = PRODUCTS[0];

afterEach(() => {
  useCartStore.setState({ items: [], isOpen: false });
});

describe('BuyBox', () => {
  it('renders the product name and price', () => {
    render(<BuyBox product={dalatWashed} />);

    expect(screen.getByRole('heading', { name: dalatWashed.name })).toBeInTheDocument();
    expect(screen.getByText('280.000 ₫')).toBeInTheDocument();
  });

  it('adds the selected weight/grind combination to the cart and opens it', async () => {
    render(<BuyBox product={dalatWashed} />);

    await userEvent.click(screen.getByRole('button', { name: '500 g' }));
    await userEvent.click(screen.getByRole('button', { name: 'Phin' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }));

    const state = useCartStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ name: dalatWashed.name, options: '500 g · Phin' });
  });

  it('does not allow selecting a disabled grind option', async () => {
    render(<BuyBox product={dalatWashed} />);

    expect(screen.getByRole('button', { name: 'Cold brew' })).toBeDisabled();
  });
});
