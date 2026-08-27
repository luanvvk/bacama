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

const MESSAGES: Record<string, Record<string, string>> = {
  Checkout: {
    paymentHeading: 'How would you like to pay?',
    paymentSubtext:
      "Pick one below. We never store your card details — every payment happens on the provider's own page.",
    whereShipHeading: 'Where should it go?',
    fullNameLabel: 'Full name',
    phoneLabel: 'Phone',
    emailLabel: 'Email',
    emailHint: "We'll send your receipt here once the order is confirmed.",
    addressLabel: 'Address',
    provinceLabel: 'Province / City',
    deliveryLabel: 'How to receive',
    pickupForcedNote:
      'Bakery items and drinks in your basket are pickup-only, so the whole order will be collected at Lý Tự Trọng.',
    noteLabel: 'Note for the shop',
    notePlaceholder: 'e.g. grind for phin, deliver in the afternoon…',
    shippingLabelGhn: 'Shipping · GHN',
    shippingLabelPickup: 'Pickup',
    orderHint: "Your coffee is roasted before it ships. Today's order rides tomorrow's batch.",
    totalLabel: 'Total',
  },
  'PaymentMethod.zalopay': {
    label: 'ZaloPay',
    description: 'Open ZaloPay, confirm, done',
    meta: 'Popular',
    cta: 'Pay with ZaloPay',
  },
  'PaymentMethod.momo': {
    label: 'MoMo',
    description: 'MoMo wallet · scan or open the app',
    meta: 'Free',
    cta: 'Pay with MoMo',
  },
  'PaymentMethod.vnpay': {
    label: 'VNPay QR',
    description: 'Scan with any banking app',
    meta: 'Free',
    cta: 'Generate a VNPay QR',
  },
  'PaymentMethod.bank': {
    label: 'Bank transfer',
    description: 'Vietcombank · Techcombank · BIDV',
    meta: 'Free',
    cta: 'Show bank transfer details',
  },
  'PaymentMethod.card': {
    label: 'International card',
    description: 'Visa · Mastercard · JCB',
    cta: 'Pay by card',
  },
  'PaymentMethod.cod': {
    label: 'Cash on delivery',
    description: 'Pay the courier when the parcel arrives',
    meta: 'Nationwide',
    cta: 'Place order · pay on delivery',
  },
  DeliveryOption: {
    ghn: 'GHN home delivery · 2–3 days',
    pickup: 'Collect at a café · within 2 hours',
  },
  CheckoutValidation: {
    fullName: 'Enter your full name',
    phone: 'Enter a valid phone number',
    email: 'Enter a valid email address',
    address: 'Enter your delivery address',
    province: 'Choose a province or city',
    deliveryOption: 'Choose how to receive your order',
  },
  OrderSummary: {
    yourOrder: 'Your order',
    total: 'Total',
    subtotal: 'Subtotal',
    shippingGhn: 'Shipping · GHN',
    free: 'Free',
    shipTo: 'Ship to',
  },
};

jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => {
    if (namespace === 'PaymentMethod') {
      const [value, field] = key.split('.');
      return MESSAGES[`PaymentMethod.${value}`]?.[field] ?? key;
    }
    return MESSAGES[namespace]?.[key] ?? key;
  },
}));

const DALAT_WASHED = { id: 'dalat-washed-250-g-phin', name: 'Đà Lạt Washed', priceVnd: 280000 };

const fillShippingFields = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Full name'), 'Lê Thị Ngọc');
  await user.type(screen.getByLabelText('Phone'), '0905123456');
  await user.type(screen.getByLabelText('Email'), 'ngoc@example.com');
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
      shipping: { fullName: 'Lê Thị Ngọc', phone: '0905123456', email: 'ngoc@example.com' },
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

  it('forces pickup-only delivery when the cart has a bakery or drink item', async () => {
    useCartStore.setState({
      items: [
        { ...DALAT_WASHED, quantity: 1 },
        { id: 'croissant', name: 'Croissant', priceVnd: 75000, quantity: 1, kind: 'bakery' },
      ],
      isOpen: false,
    });
    const user = userEvent.setup();
    render(<CheckoutForm />);

    expect(screen.getByLabelText('How to receive')).toHaveTextContent('Collect at a café');
    expect(screen.getByLabelText('How to receive')).toHaveAttribute('data-disabled');
    expect(
      screen.getByText(/pickup-only, so the whole order will be collected/),
    ).toBeInTheDocument();

    await fillShippingFields(user);
    await user.click(screen.getByRole('button', { name: 'Pay with ZaloPay' }));

    expect(useCheckoutStore.getState().order).toMatchObject({
      shipping: { deliveryOption: 'pickup' },
    });
  });
});
