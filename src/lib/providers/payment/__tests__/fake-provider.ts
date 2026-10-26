import { createHmac, timingSafeEqual } from 'node:crypto';

import { InvalidWebhookSignatureError } from '../types';
import type { PaymentProvider } from '../types';

export const FAKE_WEBHOOK_SECRET = 'test-webhook-secret';

export const signFakeWebhook = (rawBody: Buffer | string) =>
  createHmac('sha256', FAKE_WEBHOOK_SECRET).update(rawBody).digest('hex');

/** Test-only adapter; deliberately not registered in the production factory. */
export const fakeProvider: PaymentProvider = {
  async pay() {
    throw new Error('not used in tests');
  },
  parseWebhook(rawBody, headers) {
    const expected = Buffer.from(signFakeWebhook(rawBody));
    const received = Buffer.from(headers['x-signature'] ?? '');
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      throw new InvalidWebhookSignatureError();
    }
    return JSON.parse(rawBody.toString('utf8'));
  },
  async refund() {
    throw new Error('not used in tests');
  },
};
