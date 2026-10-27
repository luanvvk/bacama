import type { NextRequest } from 'next/server';

import { getPaymentProviderByMethod, PaymentMethodUnavailableError } from '@/lib/providers/payment';
import { InvalidWebhookSignatureError } from '@/lib/providers/payment/types';
import type { PaymentMethodValue } from '@/lib/providers/payment/types';
import { markOrderFailed, markOrderPaid } from '@/services/orders/mark-order-paid';

// COD has no gateway, so it has no webhook.
const WEBHOOK_METHODS: readonly string[] = [
  'zalopay',
  'momo',
  'vnpay_qr',
  'bank_transfer',
  'card',
] satisfies PaymentMethodValue[];

const notFound = () => Response.json({ error: 'Not found' }, { status: 404 });

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) => {
  const { provider: segment } = await params;
  if (!WEBHOOK_METHODS.includes(segment)) return notFound();

  let result;
  try {
    const provider = getPaymentProviderByMethod(segment as PaymentMethodValue);
    const rawBody = Buffer.from(await request.arrayBuffer());
    result = provider.parseWebhook(rawBody, Object.fromEntries(request.headers));
  } catch (error) {
    if (error instanceof PaymentMethodUnavailableError) return notFound();
    if (error instanceof InvalidWebhookSignatureError) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }
    return Response.json({ error: 'Invalid webhook' }, { status: 400 });
  }

  if (result.status === 'pending') return Response.json({ received: true });

  const outcome =
    result.status === 'paid'
      ? await markOrderPaid(result.providerRef, result.amountVnd)
      : await markOrderFailed(result.providerRef);

  if (outcome === 'not_found') return notFound();
  if (outcome === 'amount_mismatch') {
    return Response.json({ error: 'Amount mismatch' }, { status: 400 });
  }
  // 200 so the gateway stops retrying; the order is flagged for a human.
  if (outcome === 'needs_review') return Response.json({ received: true, needsReview: true });
  return Response.json(
    outcome === 'already_processed'
      ? { received: true, alreadyProcessed: true }
      : { received: true },
  );
};
