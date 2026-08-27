import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PaymentProcessing } from '../index';
import { useCheckoutStore } from '@/stores/checkout';

const push = jest.fn();
const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
}));

const MESSAGES: Record<string, Record<string, string>> = {
  PaymentProcessing: {
    bankHeading: 'Transfer to finish.',
    bankSubtext:
      'Send the total to the account below, using your order ref as the transfer note. We confirm manually once it lands — usually within the hour.',
    bankLabel: 'Bank',
    accountNameLabel: 'Account name',
    accountNumberLabel: 'Account number',
    amountLabel: 'Amount',
    transferNoteLabel: 'Transfer note',
    madeTransfer: "I've made the transfer",
    cardHeading: 'Processing your card.',
    qrHeading: 'Scan to finish.',
    cardSubtext:
      'Your bank may ask for one extra confirmation step. Hang tight — this only takes a moment.',
    qrSubtext:
      'Open {method} on your phone, scan the code below and confirm. This page moves on as soon as {method} confirms.',
    qrPlaceholder: 'Placeholder — the payment gateway renders the real code here.',
    orderRefLabel: 'Order ref · {ref}',
    cardProcessing: 'Processing your card…',
    waitingForConfirm: 'Waiting for {method} to confirm…',
    changePaymentMethod: '← Change payment method',
    contactLabel: 'Contact',
    shipToLabel: 'Ship to',
  },
  'PaymentMethod.zalopay': { label: 'ZaloPay' },
  'PaymentMethod.bank': { label: 'Bank transfer' },
  OrderSummary: {
    yourOrder: 'Your order',
    total: 'Total',
    subtotal: 'Subtotal',
    shippingGhn: 'Shipping · GHN',
    free: 'Free',
    shipTo: 'Ship to',
  },
};

const interpolate = (template: string, params?: Record<string, string>) =>
  params
    ? Object.entries(params).reduce(
        (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
        template,
      )
    : template;

jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string, params?: Record<string, string>) => {
    if (namespace === 'PaymentMethod') {
      const [value, field] = key.split('.');
      return MESSAGES[`PaymentMethod.${value}`]?.[field] ?? key;
    }
    return interpolate(MESSAGES[namespace]?.[key] ?? key, params);
  },
}));

const ORDER = {
  orderRef: 'BCM-2419',
  items: [{ id: 'dalat-washed-250-g-phin', name: 'Đà Lạt Washed', priceVnd: 280000, quantity: 1 }],
  subtotalVnd: 280000,
  totalVnd: 280000,
  shipping: {
    fullName: 'Lê Thị Ngọc',
    phone: '0905 123 456',
    email: 'ngoc@example.com',
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
