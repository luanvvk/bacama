import { render, screen } from '@testing-library/react';

import { OrderConfirmation } from '../index';
import { useCartStore } from '@/stores/cart';
import { useCheckoutStore } from '@/stores/checkout';

const push = jest.fn();
const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
}));

const MESSAGES: Record<string, Record<string, string>> = {
  OrderConfirmation: {
    thankYou: 'Thank you, {name}.',
    codPickupMsg: "We've received your order. Have the total ready when you collect it.",
    codDeliveryMsg: "We've received your order. Have the total ready for the courier on delivery.",
    paidMsg: "We've received your payment. We'll message you on Zalo with updates.",
    orderRefLine: 'Order ref · {ref} · {method}',
    whereOrderIsPickup: 'Where your order is',
    whereOrderIsDelivery: 'Where your parcel is',
    pickupTrackerNote: "We'll message you on Zalo the moment it's ready to collect at Lý Tự Trọng.",
    deliveryTrackerNote:
      "Your coffee rides tomorrow morning's batch — packed as soon as it cools and shipped the same afternoon. The tracking number arrives over Zalo the moment GHN picks up.",
    continueShopping: 'Continue shopping',
    dueOnPickup: 'Due on pickup',
    dueOnDelivery: 'Due on delivery',
    paid: 'Paid',
    shippingGhn: 'Shipping · GHN',
    pickup: 'Pickup',
    shipTo: 'Ship to',
    contact: 'Contact',
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
  },
  'PaymentMethod.zalopay': { label: 'ZaloPay' },
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
