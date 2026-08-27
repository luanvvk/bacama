'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { getPaymentMethod } from '@/constants/checkout';
import { useCartStore } from '@/stores/cart';
import { useCheckoutStore, type CheckoutOrder } from '@/stores/checkout';
import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';

import { OrderSummary } from '../../../_components/OrderSummary';
import { OrderTracker } from '../OrderTracker';

export interface OrderConfirmationProps {
  /** A real DB-fetched order (undefined = no ref in the URL, fall back to
   * client state; null = a ref was given but no matching order exists). */
  initialOrder?: CheckoutOrder | null;
}

export const OrderConfirmation = ({ initialOrder }: OrderConfirmationProps) => {
  const t = useTranslations('OrderConfirmation');
  const tPaymentMethod = useTranslations('PaymentMethod');
  const router = useRouter();
  const storeOrder = useCheckoutStore((state) => state.order);
  const clearCart = useCartStore((state) => state.clearCart);
  const order = initialOrder !== undefined ? initialOrder : storeOrder;
  // Only a DB-backed order has a real row the tracking route can find —
  // the still-simulated flow's ref never made it to the database.
  const isRealOrder = initialOrder !== undefined && initialOrder !== null;

  useEffect(() => {
    if (!order) {
      router.replace('/checkout');
      return;
    }

    clearCart();
  }, [order, router, clearCart]);

  if (!order) return null;

  const method = getPaymentMethod(order.paymentMethod);
  const methodLabel = tPaymentMethod(`${method.value}.label`);
  const isCod = method.kind === 'cod';
  const isPickup = order.shipping.deliveryOption === 'pickup';
  const firstName = order.shipping.fullName.trim().split(' ').pop();

  const orderPlacedOrPaid = isCod ? t('stepOrderPlaced') : t('stepPaid');
  const trackerSteps = isPickup
    ? [
        { label: orderPlacedOrPaid, detail: t('detailToday'), done: true },
        { label: t('stepPreparing'), detail: t('detailToday'), done: true },
        { label: t('stepReadyForPickup'), detail: t('detailWithin2Hours'), done: false },
      ]
    : [
        { label: orderPlacedOrPaid, detail: t('detailToday'), done: true },
        { label: t('stepRoasting'), detail: t('detailTomorrow0600'), done: true },
        { label: t('stepGhnCollects'), detail: t('detailTomorrow1600'), done: false },
        { label: t('stepOutForDelivery'), detail: t('detailExpected2to3Days'), done: false },
      ];

  return (
    <div>
      <div className="py-6 text-center">
        <CheckCircle2
          className="text-success mx-auto size-14"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <Heading as="h1" size="lg" className="mt-4">
          {t('thankYou', { name: firstName ?? '' })}
        </Heading>
        <Text variant="muted" className="mx-auto mt-3 max-w-prose">
          {isCod ? (isPickup ? t('codPickupMsg') : t('codDeliveryMsg')) : t('paidMsg')}
        </Text>
        <p className="text-muted-foreground mt-4 font-mono text-xs tracking-widest uppercase">
          {t('orderRefLine', { ref: order.orderRef, method: methodLabel })}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border p-4">
            <p className="font-heading text-base font-medium">
              {isPickup ? t('whereOrderIsPickup') : t('whereOrderIsDelivery')}
            </p>
            <div className="mt-4">
              <OrderTracker steps={trackerSteps} />
            </div>
            <p className="text-muted-foreground mt-4 text-sm">
              {isPickup ? t('pickupTrackerNote') : t('deliveryTrackerNote')}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/shop">{t('continueShopping')}</Link>
            </Button>
            {isRealOrder && (
              <Button asChild variant="outline" size="lg">
                <Link href={`/orders/${order.orderRef}`}>{t('trackOrder')}</Link>
              </Button>
            )}
          </div>
        </div>

        <OrderSummary
          items={order.items}
          subtotalVnd={order.subtotalVnd}
          totalVnd={order.totalVnd}
          totalLabel={isCod ? (isPickup ? t('dueOnPickup') : t('dueOnDelivery')) : t('paid')}
          shippingLabel={isPickup ? t('pickup') : t('shippingGhn')}
          shipToLabel={isPickup ? t('contact') : t('shipTo')}
          shipTo={{
            name: order.shipping.fullName,
            phone: order.shipping.phone,
            address: order.shipping.address,
          }}
        />
      </div>
    </div>
  );
};
