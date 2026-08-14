import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PaymentProcessing } from '../index';
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
});

describe('PaymentProcessing', () => {
  it('redirects back to checkout when there is no order', () => {
    render(<PaymentProcessing />);

    expect(replace).toHaveBeenCalledWith('/checkout');
  });

  it('auto-advances to done for a QR wallet method', () => {
    jest.useFakeTimers();
    useCheckoutStore.setState({ order: { ...ORDER, paymentMethod: 'zalopay' } });

    render(<PaymentProcessing />);
    expect(screen.getByText('Waiting for ZaloPay to confirm…')).toBeInTheDocument();

    jest.runAllTimers();
    expect(push).toHaveBeenCalledWith('/checkout/done');

    jest.useRealTimers();
  });

  it('shows bank details and waits for manual confirmation', async () => {
    const user = userEvent.setup();
    useCheckoutStore.setState({ order: { ...ORDER, paymentMethod: 'bank' } });

    render(<PaymentProcessing />);
    expect(screen.getByText('BACAMA COFFEE')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /made the transfer/ }));
    expect(push).toHaveBeenCalledWith('/checkout/done');
  });
});
