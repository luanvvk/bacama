export type PaymentMethodValue = 'zalopay' | 'momo' | 'vnpay_qr' | 'bank_transfer' | 'card' | 'cod';

export interface Routing {
  locale: 'vi' | 'en';
  addressCountry: string;
  preferredMethod?: PaymentMethodValue;
}

export interface PaymentResult {
  provider: PaymentMethodValue;
  providerRef: string;
  redirectUrl: string;
}

export type PaymentWebhookStatus = 'paid' | 'failed' | 'pending';

export interface PaymentWebhookResult {
  providerRef: string;
  status: PaymentWebhookStatus;
  /**
   * Required for `paid`: compared with the stored order total (a missing value
   * is a mismatch); never persisted from the payload.
   */
  amountVnd?: number;
}

/** Thrown by an adapter's parseWebhook when the signature does not verify. */
export class InvalidWebhookSignatureError extends Error {
  constructor() {
    super('Invalid webhook signature');
    this.name = 'InvalidWebhookSignatureError';
  }
}

export interface PaymentProvider {
  pay(amountVnd: number, orderRef: string, routing: Routing): Promise<PaymentResult>;
  parseWebhook(rawBody: Buffer, headers: Record<string, string>): PaymentWebhookResult;
  refund(providerRef: string, amountVnd: number, reason: string): Promise<void>;
}
