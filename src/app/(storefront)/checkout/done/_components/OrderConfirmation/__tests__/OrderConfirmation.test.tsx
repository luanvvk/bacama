import { render, screen } from '@testing-library/react';

import { OrderConfirmation } from '../index';
import { useCartStore } from '@/stores/cart';
import { useCheckoutStore } from '@/stores/checkout';

const push = jest.fn();
const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
}));

const ORDER = {
  orderRef: 'BCM-2419',
  items: [{ id: 'dalat-washed-250-g-phin', name: 'Đà Lạt Washed', priceVnd: 280000, quantity: 1 }],
  subtotalVnd: 280000,
  totalVnd: 280000,
  shipping: {
    fullName: 'Lê Thị Ngọc',
    phone: '0905 123 456',
    address: '27 Ngô Quyền, Hải Châu, Đà Nẵng',
    province: 'Đà Nẵng',
    deliveryOption: 'ghn',
  },
};

beforeEach(() => {
  push.mockClear();
  replace.mockClear();
  useCheckoutStore.setState({ order: null });
  useCartStore.setState({ items: [{ ...ORDER.items[0] }], isOpen: false });
});

describe('OrderConfirmation', () => {
  it('redirects back to checkout when there is no order', () => {
    render(<OrderConfirmation />);

    expect(replace).toHaveBeenCalledWith('/checkout');
  });

  it('shows the thank-you message and clears the cart for a paid order', () => {
    useCheckoutStore.setState({ order: { ...ORDER, paymentMethod: 'zalopay' } });

    render(<OrderConfirmation />);

    expect(screen.getByRole('heading', { name: 'Thank you, Ngọc.' })).toBeInTheDocument();
    expect(screen.getByText(/received your payment/)).toBeInTheDocument();
    expect(screen.getAllByText('Paid').length).toBeGreaterThan(0);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('shows delivery-owed copy for cash on delivery', () => {
    useCheckoutStore.setState({ order: { ...ORDER, paymentMethod: 'cod' } });

    render(<OrderConfirmation />);

    expect(screen.getByText(/ready for the courier/)).toBeInTheDocument();
    expect(screen.getByText('Order placed')).toBeInTheDocument();
  });
});
