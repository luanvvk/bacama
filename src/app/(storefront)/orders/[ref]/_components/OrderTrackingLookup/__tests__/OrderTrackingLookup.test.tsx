import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { OrderTrackingLookup } from '../index';

const MESSAGES: Record<string, Record<string, string>> = {
  OrderTracking: {
    heading: 'Track order {ref}',
    subtext: 'Enter the phone number used at checkout to see its status.',
    phoneLabel: 'Phone',
    phoneValidation: 'Enter a valid phone number',
    submit: 'Track order',
    notFound: "We couldn't find an order with that reference and phone number.",
    orderRefLine: 'Order ref · {ref} · {method}',
  },
  OrderConfirmation: {
    stepOrderPlaced: 'Order placed',
    stepPaid: 'Paid',
    stepPreparing: 'Preparing',
    stepReadyForPickup: 'Ready for pickup',
    stepRoasting: 'Roasting',
    stepGhnCollects: 'GHN collects',
    stepOutForDelivery: 'Out for delivery',
    detailToday: 'Today',
    detailWithin2Hours: 'Within 2 hours',
    detailTomorrow0600: 'Tomorrow, 06:00',
    detailTomorrow1600: 'Tomorrow, 16:00',
    detailExpected2to3Days: 'Expected in 2–3 days',
    pickup: 'Pickup',
    shippingGhn: 'Shipping · GHN',
    contact: 'Contact',
    shipTo: 'Ship to',
  },
  'PaymentMethod.cod': { label: 'Cash on delivery' },
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

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const ORDER = {
  orderRef: 'BCM-ABCD1234',
  paymentMethod: 'cod' as const,
  items: [{ id: 'oi1', name: '250g Bag · Arabica', priceVnd: 185000, quantity: 1 }],
  subtotalVnd: 185000,
  totalVnd: 185000,
  shipping: {
    fullName: 'Test Buyer',
    phone: '0905999888',
    email: 'test@example.com',
    address: '123 Test Street',
    province: 'Đà Nẵng',
    deliveryOption: 'ghn',
  },
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe('OrderTrackingLookup', () => {
  it('renders the lookup form with the ref in the heading', () => {
    render(<OrderTrackingLookup orderRef="BCM-ABCD1234" />);

    expect(screen.getByText('Track order BCM-ABCD1234')).toBeInTheDocument();
  });

  it('shows a not-found message when the API call fails', async () => {
    mockFetch.mockResolvedValue({ ok: false });
    const user = userEvent.setup();
    render(<OrderTrackingLookup orderRef="BCM-ABCD1234" />);

    await user.type(screen.getByLabelText('Phone'), '0900000000');
    await user.click(screen.getByRole('button', { name: 'Track order' }));

    expect(
      await screen.findByText("We couldn't find an order with that reference and phone number."),
    ).toBeInTheDocument();
  });

  it('renders the order summary and tracker when the lookup succeeds', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(ORDER) });
    const user = userEvent.setup();
    render(<OrderTrackingLookup orderRef="BCM-ABCD1234" />);

    await user.type(screen.getByLabelText('Phone'), '0905999888');
    await user.click(screen.getByRole('button', { name: 'Track order' }));

    expect(await screen.findByText(/Order ref · BCM-ABCD1234/)).toBeInTheDocument();
    expect(screen.getByText('250g Bag · Arabica')).toBeInTheDocument();
    expect(screen.getByText('Order placed')).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/orders/BCM-ABCD1234/track',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
