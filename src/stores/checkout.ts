import { create } from 'zustand';

import type { CartItem } from '@/stores/cart';
import type { PaymentMethodValue } from '@/constants/checkout';

export interface ShippingDetails {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  deliveryOption: string;
  note?: string;
}

export interface CheckoutOrder {
  orderRef: string;
  items: CartItem[];
  subtotalVnd: number;
  totalVnd: number;
  paymentMethod: PaymentMethodValue;
  shipping: ShippingDetails;
}

interface PlaceOrderInput {
  items: CartItem[];
  subtotalVnd: number;
  totalVnd: number;
  paymentMethod: PaymentMethodValue;
  shipping: ShippingDetails;
}

interface CheckoutState {
  order: CheckoutOrder | null;
  placeOrder: (input: PlaceOrderInput) => CheckoutOrder;
  clear: () => void;
}

const generateOrderRef = () => `BCM-${Math.floor(1000 + Math.random() * 9000)}`;

export const useCheckoutStore = create<CheckoutState>((set) => ({
  order: null,
  placeOrder: (input) => {
    const order: CheckoutOrder = { ...input, orderRef: generateOrderRef() };
    set({ order });
    return order;
  },
  clear: () => set({ order: null }),
}));
