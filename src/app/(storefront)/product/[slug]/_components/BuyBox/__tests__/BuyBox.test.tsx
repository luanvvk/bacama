import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BuyBox } from '../index';
import { PRODUCTS } from '@/services/catalog/__fixtures__/products';
import { useCartStore } from '@/stores/cart';

const MESSAGES: Record<string, string> = {
  decrease: 'Decrease quantity',
  increase: 'Increase quantity',
  weightLabel: 'Weight',
  grindLabel: 'Grind for',
  addToCart: 'Add to cart',
  soldOut: 'Sold out today',
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

  it('disables adding to cart and shows a sold-out label when the product is sold out', async () => {
    render(<BuyBox product={{ ...dalatWashed, soldOut: true }} />);

    const button = screen.getByRole('button', { name: 'Sold out today' });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('does not render a dead ZaloPay buy-now button', () => {
    render(<BuyBox product={dalatWashed} />);

    expect(screen.queryByRole('button', { name: /zalopay/i })).not.toBeInTheDocument();
  });
});
