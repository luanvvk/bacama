'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, QrCode } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { BANK_TRANSFER_DETAILS, getPaymentMethod } from '@/constants/checkout';
import { formatVnd } from '@/lib/format-price';
import { useCheckoutStore } from '@/stores/checkout';
import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';

import { OrderSummary } from '../../../_components/OrderSummary';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 30000;

type PollState = 'waiting' | 'failed' | 'timeout';

export interface PaymentProcessingProps {
  orderRef?: string;
}

export const PaymentProcessing = ({ orderRef: refFromUrl }: PaymentProcessingProps) => {
  const t = useTranslations('PaymentProcessing');
  const tPaymentMethod = useTranslations('PaymentMethod');
  const router = useRouter();
  const order = useCheckoutStore((state) => state.order);
  const [pollState, setPollState] = useState<PollState>('waiting');
  const orderRef = refFromUrl ?? order?.orderRef;
  const isBank = order?.paymentMethod === 'bank';

  useEffect(() => {
    if (!order) router.replace('/checkout');
  }, [order, router]);

  useEffect(() => {
    if (!orderRef || pollState !== 'waiting') return undefined;

    let stopped = false;
    const poll = async () => {
      try {
        const response = await fetch(`/api/orders/${orderRef}/status`);
        if (stopped || !response.ok) return;
        const { status } = (await response.json()) as { status: string };
        if (stopped) return;
        if (status === 'paid') router.push(`/checkout/done?ref=${orderRef}`);
        else if (status === 'failed') setPollState('failed');
      } catch {
        // transient network error: the next tick retries
      }
    };

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [orderRef, pollState, router]);

  useEffect(() => {
    // Bank transfers are confirmed by hand and can take an hour, so they never time out.
    if (!orderRef || isBank) return undefined;

    const timeout = setTimeout(
      () => setPollState((state) => (state === 'waiting' ? 'timeout' : state)),
      POLL_TIMEOUT_MS,
    );
    return () => clearTimeout(timeout);
  }, [orderRef, isBank]);

  if (!order) return null;

  const method = getPaymentMethod(order.paymentMethod);
  const methodLabel = tPaymentMethod(`${method.value}.label`);
  const isPickup = order.shipping.deliveryOption === 'pickup';

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
      <div>
        {method.kind === 'bank' ? (
          <>
            <Heading as="h1" size="lg">
              {t('bankHeading')}
            </Heading>
            <Text variant="muted" className="mt-2 max-w-prose">
              {t('bankSubtext')}
            </Text>
            <dl className="mt-6 flex flex-col gap-2 rounded-lg border p-4 text-sm">
              {[
                [t('bankLabel'), BANK_TRANSFER_DETAILS.bankName],
                [t('accountNameLabel'), BANK_TRANSFER_DETAILS.accountName],
                [t('accountNumberLabel'), BANK_TRANSFER_DETAILS.accountNumber],
                [t('amountLabel'), formatVnd(order.totalVnd)],
                [t('transferNoteLabel'), order.orderRef],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-mono font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <Button
              type="button"
              size="lg"
              className="mt-6"
              onClick={() => router.push(`/orders/${order.orderRef}`)}
            >
              {t('madeTransfer')}
            </Button>
          </>
        ) : (
          <>
            <Heading as="h1" size="lg">
              {method.kind === 'card' ? t('cardHeading') : t('qrHeading')}
            </Heading>
            <Text variant="muted" className="mt-2 max-w-prose">
              {method.kind === 'card' ? t('cardSubtext') : t('qrSubtext', { method: methodLabel })}
            </Text>

            {method.kind === 'qr' && (
              <div className="mt-6 flex flex-col items-center gap-3 rounded-lg border p-8 text-center">
                <QrCode
                  className="text-muted-foreground size-32"
                  strokeWidth={1}
                  aria-hidden="true"
                />
                <p className="text-muted-foreground text-xs">{t('qrPlaceholder')}</p>
                <p className="font-heading text-2xl font-semibold">{formatVnd(order.totalVnd)}</p>
                <p className="text-muted-foreground font-mono text-xs">
                  {t('orderRefLabel', { ref: order.orderRef })}
                </p>
              </div>
            )}

            {pollState === 'waiting' && (
              <div
                className="mt-6 flex items-center gap-3 border-t pt-6"
                role="status"
                aria-live="polite"
              >
                <Loader2 className="text-primary size-5 animate-spin" aria-hidden="true" />
                <p className="text-muted-foreground text-sm">
                  {method.kind === 'card'
                    ? t('cardProcessing')
                    : t('waitingForConfirm', { method: methodLabel })}
                </p>
              </div>
            )}
            {pollState === 'failed' && (
              <p className="text-destructive mt-6 border-t pt-6 text-sm" role="alert">
                {t('paymentFailed')}
              </p>
            )}
            {pollState === 'timeout' && (
              <div className="mt-6 border-t pt-6" role="status">
                <p className="text-sm">{t('stillProcessing', { ref: order.orderRef })}</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href={`/orders/${order.orderRef}`}>{t('trackOrder')}</Link>
                </Button>
              </div>
            )}
          </>
        )}

        <Button asChild variant="ghost" size="sm" className="mt-6">
          <Link href="/checkout">{t('changePaymentMethod')}</Link>
        </Button>
      </div>

      <OrderSummary
        items={order.items}
        subtotalVnd={order.subtotalVnd}
        totalVnd={order.totalVnd}
        showBreakdown={false}
        shipToLabel={isPickup ? t('contactLabel') : t('shipToLabel')}
        shipTo={{
          name: order.shipping.fullName,
          phone: order.shipping.phone,
          address: order.shipping.address,
        }}
      />
    </div>
  );
};
