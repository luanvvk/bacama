import type { PaymentProvider, Routing } from './types';

export const getPaymentProvider = (_routing: Routing): PaymentProvider => {
  throw new Error('PaymentProvider not implemented until Phase 3');
};
