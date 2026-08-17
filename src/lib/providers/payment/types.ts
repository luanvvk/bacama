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
}

export interface PaymentProvider {
  pay(amountVnd: number, orderRef: string, routing: Routing): Promise<PaymentResult>;
  parseWebhook(rawBody: Buffer, headers: Record<string, string>): PaymentWebhookResult;
  refund(providerRef: string, amountVnd: number, reason: string): Promise<void>;
}
