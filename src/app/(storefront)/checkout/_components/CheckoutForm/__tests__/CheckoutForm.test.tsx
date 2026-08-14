import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CheckoutForm } from '../index';
import { useCartStore } from '@/stores/cart';
import { useCheckoutStore } from '@/stores/checkout';

const push = jest.fn();
const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
}));

const DALAT_WASHED = { id: 'dalat-washed-250-g-phin', name: 'Đà Lạt Washed', priceVnd: 280000 };

const fillShippingFields = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Full name'), 'Lê Thị Ngọc');
  await user.type(screen.getByLabelText('Phone'), '0905123456');
  await user.type(screen.getByLabelText('Address'), '27 Ngô Quyền, Hải Châu, Đà Nẵng');
};

beforeEach(() => {
  useCartStore.setState({ items: [{ ...DALAT_WASHED, quantity: 1 }], isOpen: false });
  useCheckoutStore.setState({ order: null });
  push.mockClear();
  replace.mockClear();
});

describe('CheckoutForm', () => {
  it('places the order and routes to the pay step for an online method', async () => {
    const user = userEvent.setup();
    render(<CheckoutForm />);

    await fillShippingFields(user);
    await user.click(screen.getByRole('button', { name: 'Pay with ZaloPay' }));

    expect(useCheckoutStore.getState().order).toMatchObject({
      paymentMethod: 'zalopay',
      subtotalVnd: 280000,
      shipping: { fullName: 'Lê Thị Ngọc', phone: '0905123456' },
    });
    expect(push).toHaveBeenCalledWith('/checkout/pay');
  });

  it('places the order and routes straight to done for cash on delivery', async () => {
    const user = userEvent.setup();
    render(<CheckoutForm />);

    await user.click(screen.getByRole('radio', { name: /Cash on delivery/ }));
    await fillShippingFields(user);
    await user.click(screen.getByRole('button', { name: 'Place order · pay on delivery' }));

    expect(useCheckoutStore.getState().order).toMatchObject({ paymentMethod: 'cod' });
    expect(push).toHaveBeenCalledWith('/checkout/done');
  });

  it('does not submit when required shipping fields are missing', async () => {
    const user = userEvent.setup();
    render(<CheckoutForm />);

    await user.click(screen.getByRole('button', { name: 'Pay with ZaloPay' }));

    expect(useCheckoutStore.getState().order).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it('redirects to the shop when the cart is empty', () => {
    useCartStore.setState({ items: [], isOpen: false });
    render(<CheckoutForm />);

    expect(replace).toHaveBeenCalledWith('/shop');
  });
});
