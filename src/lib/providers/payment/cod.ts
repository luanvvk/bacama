import type { PaymentProvider } from './types';

export const codProvider: PaymentProvider = {
  async pay(_amountVnd, orderRef) {
    return {
      provider: 'cod',
      providerRef: orderRef,
      redirectUrl: `/checkout/done?ref=${encodeURIComponent(orderRef)}`,
    };
  },
  parseWebhook() {
    throw new Error('COD has no gateway webhook');
  },
  async refund() {
    throw new Error('COD has no gateway refund');
  },
};
