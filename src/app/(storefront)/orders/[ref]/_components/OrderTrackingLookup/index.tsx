'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { getPaymentMethod } from '@/constants/checkout';
import type { CheckoutOrder } from '@/stores/checkout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Text } from '@/components/ui/Typography';
import { ControlledInput } from '@/components/form/ControlledInput';

import { OrderSummary } from '@/app/(storefront)/checkout/_components/OrderSummary';
import { OrderTracker } from '@/app/(storefront)/checkout/done/_components/OrderTracker';

import { buildTrackOrderSchema, type TrackOrderFormValues } from './schema';

export interface OrderTrackingLookupProps {
  orderRef: string;
}

export const OrderTrackingLookup = ({ orderRef }: OrderTrackingLookupProps) => {
  const t = useTranslations('OrderTracking');
  const tConfirmation = useTranslations('OrderConfirmation');
  const tPaymentMethod = useTranslations('PaymentMethod');
  const [status, setStatus] = useState<'idle' | 'not-found'>('idle');
  const [order, setOrder] = useState<CheckoutOrder | null>(null);

  const { control, handleSubmit, formState } = useForm<TrackOrderFormValues>({
    resolver: zodResolver(buildTrackOrderSchema({ phone: t('phoneValidation') })),
    defaultValues: { phone: '' },
  });

  const onSubmit = async (values: TrackOrderFormValues) => {
    setStatus('idle');
    setOrder(null);

    const response = await fetch(`/api/orders/${orderRef}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: values.phone }),
    });

    if (!response.ok) {
      setStatus('not-found');
      return;
    }

    setOrder((await response.json()) as CheckoutOrder);
  };

  if (order) {
    const method = getPaymentMethod(order.paymentMethod);
    const isCod = method.kind === 'cod';
    const isPickup = order.shipping.deliveryOption === 'pickup';
    const orderPlacedOrPaid = isCod ? tConfirmation('stepOrderPlaced') : tConfirmation('stepPaid');
    const trackerSteps = isPickup
      ? [
          { label: orderPlacedOrPaid, detail: tConfirmation('detailToday'), done: true },
          {
            label: tConfirmation('stepPreparing'),
            detail: tConfirmation('detailToday'),
            done: true,
          },
          {
            label: tConfirmation('stepReadyForPickup'),
            detail: tConfirmation('detailWithin2Hours'),
            done: false,
          },
        ]
      : [
          { label: orderPlacedOrPaid, detail: tConfirmation('detailToday'), done: true },
          {
            label: tConfirmation('stepRoasting'),
            detail: tConfirmation('detailTomorrow0600'),
            done: true,
          },
          {
            label: tConfirmation('stepGhnCollects'),
            detail: tConfirmation('detailTomorrow1600'),
            done: false,
          },
          {
            label: tConfirmation('stepOutForDelivery'),
            detail: tConfirmation('detailExpected2to3Days'),
            done: false,
          },
        ];

    return (
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              {t('orderRefLine', {
                ref: order.orderRef,
                method: tPaymentMethod(`${method.value}.label`),
              })}
            </p>
            <div className="mt-4">
              <OrderTracker steps={trackerSteps} />
            </div>
          </div>
        </div>

        <OrderSummary
          items={order.items}
          subtotalVnd={order.subtotalVnd}
          totalVnd={order.totalVnd}
          shippingLabel={isPickup ? tConfirmation('pickup') : tConfirmation('shippingGhn')}
          shipToLabel={isPickup ? tConfirmation('contact') : tConfirmation('shipTo')}
          shipTo={{
            name: order.shipping.fullName,
            phone: order.shipping.phone,
            address: order.shipping.address,
          }}
        />
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>{t('heading', { ref: orderRef })}</CardTitle>
      </CardHeader>
      <CardContent>
        <Text variant="muted" className="mb-4">
          {t('subtext')}
        </Text>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <ControlledInput control={control} name="phone" label={t('phoneLabel')} />
          {status === 'not-found' && (
            <Text variant="muted" className="text-destructive text-sm">
              {t('notFound')}
            </Text>
          )}
          <Button type="submit" disabled={formState.isSubmitting}>
            {t('submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
