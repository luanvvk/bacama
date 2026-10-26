import { act, render, screen } from '@testing-library/react';

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
    paymentFailed: 'The payment failed.',
    stillProcessing: 'Not confirmed yet. Order {ref} is saved.',
    trackOrder: 'Check order status',
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

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const respondWith = (status: string) =>
  mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ status }) });

const advance = (ms: number) => act(() => jest.advanceTimersByTimeAsync(ms));

beforeEach(() => {
  push.mockClear();
  replace.mockClear();
  mockFetch.mockReset();
  respondWith('pending');
  jest.useFakeTimers();
  useCheckoutStore.setState({ order: null });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('PaymentProcessing', () => {
  it('redirects back to checkout when there is no order', () => {
    render(<PaymentProcessing />);

    expect(replace).toHaveBeenCalledWith('/checkout');
  });

  it('keeps waiting while pending, then navigates to done once paid', async () => {
    useCheckoutStore.setState({ order: { ...ORDER, paymentMethod: 'zalopay' } });

    render(<PaymentProcessing orderRef="BCM-2419" />);
    expect(screen.getByText('Waiting for ZaloPay to confirm…')).toBeInTheDocument();

    await advance(3000);
    expect(mockFetch).toHaveBeenCalledWith('/api/orders/BCM-2419/status');
    expect(push).not.toHaveBeenCalled();

    respondWith('paid');
    await advance(3000);
    expect(push).toHaveBeenCalledWith('/checkout/done?ref=BCM-2419');
  });

  it('shows an honest still-processing message after 30s and never navigates', async () => {
    useCheckoutStore.setState({ order: { ...ORDER, paymentMethod: 'zalopay' } });

    render(<PaymentProcessing orderRef="BCM-2419" />);
    await advance(30000);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Not confirmed yet. Order BCM-2419 is saved.',
    );
    expect(screen.getByRole('link', { name: 'Check order status' })).toHaveAttribute(
      'href',
      '/orders/BCM-2419',
    );

    const calls = mockFetch.mock.calls.length;
    await advance(9000);
    expect(mockFetch).toHaveBeenCalledTimes(calls);
    expect(push).not.toHaveBeenCalled();
  });

  it('shows the failure state when the order failed', async () => {
    respondWith('failed');
    useCheckoutStore.setState({ order: { ...ORDER, paymentMethod: 'zalopay' } });

    render(<PaymentProcessing orderRef="BCM-2419" />);
    await advance(3000);

    expect(screen.getByRole('alert')).toHaveTextContent('The payment failed.');
    expect(screen.getByRole('link', { name: '← Change payment method' })).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('stops polling on unmount', async () => {
    useCheckoutStore.setState({ order: { ...ORDER, paymentMethod: 'zalopay' } });

    const { unmount } = render(<PaymentProcessing orderRef="BCM-2419" />);
    await advance(3000);
    const calls = mockFetch.mock.calls.length;

    unmount();
    await advance(9000);
    expect(mockFetch).toHaveBeenCalledTimes(calls);
  });

  it('shows bank details; the transfer button goes to order tracking, not done', () => {
    useCheckoutStore.setState({ order: { ...ORDER, paymentMethod: 'bank' } });

    render(<PaymentProcessing orderRef="BCM-2419" />);
    expect(screen.getByText('BACAMA COFFEE')).toBeInTheDocument();

    act(() => screen.getByRole('button', { name: /made the transfer/ }).click());
    expect(push).toHaveBeenCalledWith('/orders/BCM-2419');
  });
});
