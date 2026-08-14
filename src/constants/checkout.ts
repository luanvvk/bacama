export type PaymentMethodValue = 'zalopay' | 'momo' | 'vnpay' | 'bank' | 'card' | 'cod';

export interface PaymentMethod {
  value: PaymentMethodValue;
  label: string;
  description: string;
  meta?: string;
  kind: 'qr' | 'bank' | 'card' | 'cod';
  cta: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    value: 'zalopay',
    label: 'ZaloPay',
    description: 'Open ZaloPay, confirm, done',
    meta: 'Popular',
    kind: 'qr',
    cta: 'Pay with ZaloPay',
  },
  {
    value: 'momo',
    label: 'MoMo',
    description: 'MoMo wallet · scan or open the app',
    meta: 'Free',
    kind: 'qr',
    cta: 'Pay with MoMo',
  },
  {
    value: 'vnpay',
    label: 'VNPay QR',
    description: 'Scan with any banking app',
    meta: 'Free',
    kind: 'qr',
    cta: 'Generate a VNPay QR',
  },
  {
    value: 'bank',
    label: 'Bank transfer',
    description: 'Vietcombank · Techcombank · BIDV',
    meta: 'Free',
    kind: 'bank',
    cta: 'Show bank transfer details',
  },
  {
    value: 'card',
    label: 'International card',
    description: 'Visa · Mastercard · JCB',
    kind: 'card',
    cta: 'Pay by card',
  },
  {
    value: 'cod',
    label: 'Cash on delivery',
    description: 'Pay the courier when the parcel arrives',
    meta: 'Nationwide',
    kind: 'cod',
    cta: 'Place order · pay on delivery',
  },
];

export const getPaymentMethod = (value: PaymentMethodValue) =>
  PAYMENT_METHODS.find((method) => method.value === value)!;

export const BANK_TRANSFER_DETAILS = {
  bankName: 'Vietcombank',
  accountName: 'BACAMA COFFEE',
  accountNumber: '0071 0001 2345 6',
};

export const PROVINCES = ['Đà Nẵng', 'Hà Nội', 'TP. Hồ Chí Minh', 'Quảng Nam'];

export interface DeliveryOption {
  value: string;
  label: string;
}

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  { value: 'ghn', label: 'GHN home delivery · 2–3 days' },
  { value: 'pickup', label: 'Collect at a café · within 2 hours' },
];
