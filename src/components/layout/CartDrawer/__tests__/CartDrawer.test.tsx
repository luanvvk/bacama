import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CartDrawer } from '../index';
import { useCartStore } from '@/stores/cart';

const MESSAGES: Record<string, string> = {
  title: 'Your basket',
  itemsDescription: 'Items in your shopping cart',
  pickupOnlyNotice: 'Bakery items and drinks are pickup-only.',
  freeShippingQualified: 'You qualify for free shipping.',
  freeShippingRemaining: 'Add <b>{amount}</b> more for free shipping.',
  emptyBasket: 'Your basket is empty.',
  remove: 'Remove {name}',
  subtotal: 'Subtotal',
  pickup: 'Pickup',
  shippingGhn: 'Shipping · GHN',
  free: 'Free',
  total: 'Total',
  checkOut: 'Check out',
  paymentMethods: 'ZaloPay · MoMo · VNPay QR · COD',
};

const interpolate = (template: string, params?: Record<string, unknown>) =>
  params
    ? Object.entries(params).reduce<string>(
        (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
        template,
      )
    : template;

jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string, params?: Record<string, unknown>) => interpolate(MESSAGES[key], params);
    t.rich = (key: string, params: Record<string, unknown>) => {
      const { b, ...rest } = params;
      const [before, bold, after] = interpolate(MESSAGES[key], rest).split(/<b>|<\/b>/);
      return (
        <>
          {before}
          {typeof b === 'function' ? (b as (chunks: string) => unknown)(bold) : bold}
          {after}
        </>
      );
    };
    return t;
  },
}));

const CROISSANT = { id: 'croissant', name: 'Croissant', priceVnd: 45000 };

afterEach(() => {
  useCartStore.setState({ items: [], isOpen: false });
});

describe('CartDrawer', () => {
  it('is hidden when the store is closed', () => {
    render(<CartDrawer />);

    expect(screen.queryByText('Your basket')).not.toBeInTheDocument();
  });

  it('shows an empty state and a disabled checkout button when there are no items', () => {
    useCartStore.setState({ isOpen: true });
    render(<CartDrawer />);

    expect(screen.getByText('Your basket is empty.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Check out' })).toBeDisabled();
  });

  it('lists items and lets the user change quantity', async () => {
    useCartStore.setState({ isOpen: true, items: [{ ...CROISSANT, quantity: 1 }] });
    render(<CartDrawer />);

    expect(screen.getByText('Croissant')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));

    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('removes an item when its remove button is clicked', async () => {
    useCartStore.setState({ isOpen: true, items: [{ ...CROISSANT, quantity: 1 }] });
    render(<CartDrawer />);

    await userEvent.click(screen.getByRole('button', { name: 'Remove Croissant' }));

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('links to checkout once the cart has items', () => {
    useCartStore.setState({ isOpen: true, items: [{ ...CROISSANT, quantity: 1 }] });
    render(<CartDrawer />);

    expect(screen.getByRole('link', { name: 'Check out' })).toHaveAttribute('href', '/checkout');
  });
});
