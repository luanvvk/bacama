'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';

import {
  DELIVERY_OPTIONS,
  PROVINCES,
  PAYMENT_METHODS,
  getPaymentMethod,
} from '@/constants/checkout';
import { formatVnd } from '@/lib/format-price';
import { toast } from '@/lib/toast';
import { useCartStore, useCartTotalVnd } from '@/stores/cart';
import { useCheckoutStore } from '@/stores/checkout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { ControlledInput } from '@/components/form/ControlledInput';
import { ControlledRadioGroup } from '@/components/form/ControlledRadioGroup';
import { ControlledSelect } from '@/components/form/ControlledSelect';
import { ControlledTextarea } from '@/components/form/ControlledTextarea';

import { OrderSummary } from '../OrderSummary';
import { buildCheckoutSchema, type CheckoutFormValues } from './schema';

const PROVINCE_OPTIONS = PROVINCES.map((province) => ({ label: province, value: province }));

export const CheckoutForm = () => {
  const t = useTranslations('Checkout');
  const tPaymentMethod = useTranslations('PaymentMethod');
  const tDeliveryOption = useTranslations('DeliveryOption');
  const tValidation = useTranslations('CheckoutValidation');
  const locale = useLocale();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotalVnd = useCartTotalVnd();

  const paymentMethodOptions = PAYMENT_METHODS.map((method) => ({
    value: method.value,
    label: tPaymentMethod(`${method.value}.label`),
    description: tPaymentMethod(`${method.value}.description`),
    meta: method.meta ? tPaymentMethod(`${method.value}.meta`) : undefined,
  }));
  const existingOrder = useCheckoutStore((state) => state.order);
  const placeOrder = useCheckoutStore((state) => state.placeOrder);

  // Bakery items and drinks are pickup-only (perishable, site-fulfilled) —
  // a cart containing either forces the whole order to pickup rather than
  // offering nationwide GHN delivery for the parts that could ship.
  const requiresPickup = items.some((item) => item.kind === 'bakery' || item.kind === 'menu');
  const deliveryOptions = (
    requiresPickup
      ? DELIVERY_OPTIONS.filter((option) => option.value === 'pickup')
      : DELIVERY_OPTIONS
  ).map((option) => ({ value: option.value, label: tDeliveryOption(option.value) }));

  const { control, handleSubmit, formState } = useForm<CheckoutFormValues>({
    resolver: zodResolver(
      buildCheckoutSchema({
        fullName: tValidation('fullName'),
        phone: tValidation('phone'),
        email: tValidation('email'),
        address: tValidation('address'),
        province: tValidation('province'),
        deliveryOption: tValidation('deliveryOption'),
      }),
    ),
    defaultValues: {
      paymentMethod: existingOrder?.paymentMethod ?? 'zalopay',
      fullName: existingOrder?.shipping.fullName ?? '',
      phone: existingOrder?.shipping.phone ?? '',
      email: existingOrder?.shipping.email ?? '',
      address: existingOrder?.shipping.address ?? '',
      province: existingOrder?.shipping.province ?? PROVINCES[0],
      deliveryOption: requiresPickup
        ? 'pickup'
        : (existingOrder?.shipping.deliveryOption ?? DELIVERY_OPTIONS[0].value),
      note: existingOrder?.shipping.note ?? '',
    },
  });

  const selectedMethod = getPaymentMethod(useWatch({ control, name: 'paymentMethod' }));

  useEffect(() => {
    if (items.length === 0) router.replace('/shop');
  }, [items.length, router]);

  if (items.length === 0) return null;

  const onSubmit = async (values: CheckoutFormValues) => {
    const { paymentMethod, fullName, phone, email, address, province, deliveryOption, note } =
      values;
    const shipping = { fullName, phone, email, address, province, deliveryOption, note };

    // COD needs no payment gateway, so it's the one method that can persist a
    // real order today — everything else still runs the simulated /pay flow
    // until real payment adapters exist (task 2.6).
    if (getPaymentMethod(paymentMethod).kind === 'cod') {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.productId ?? item.id,
            kind: item.kind,
            quantity: item.quantity,
            weight: item.weight,
            grind: item.grind,
          })),
          customerName: fullName,
          phone,
          email,
          note,
          paymentMethod,
          deliveryOption,
          address,
          province,
          locale,
        }),
      });

      if (!response.ok) {
        toast(t('orderFailed'));
        return;
      }

      const { ref } = (await response.json()) as { id: string; ref: string };
      placeOrder({
        items,
        subtotalVnd,
        totalVnd: subtotalVnd,
        paymentMethod,
        shipping,
        orderRef: ref,
      });
      router.push('/checkout/done');
      return;
    }

    placeOrder({ items, subtotalVnd, totalVnd: subtotalVnd, paymentMethod, shipping });
    router.push('/checkout/pay');
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-8 pb-28 lg:grid-cols-[1.4fr_1fr] lg:gap-14"
    >
      <div className="flex flex-col gap-8">
        <div>
          <Heading as="h1" size="lg">
            {t('paymentHeading')}
          </Heading>
          <Text variant="muted" className="mt-2 max-w-prose">
            {t('paymentSubtext')}
          </Text>
          <div className="mt-6">
            <ControlledRadioGroup
              control={control}
              name="paymentMethod"
              options={paymentMethodOptions}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('whereShipHeading')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ControlledInput control={control} name="fullName" label={t('fullNameLabel')} />
              <ControlledInput control={control} name="phone" label={t('phoneLabel')} />
            </div>
            <ControlledInput control={control} name="email" type="email" label={t('emailLabel')} />
            <Text variant="muted" className="text-xs">
              {t('emailHint')}
            </Text>
            <ControlledInput control={control} name="address" label={t('addressLabel')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <ControlledSelect
                control={control}
                name="province"
                label={t('provinceLabel')}
                options={PROVINCE_OPTIONS}
              />
              <ControlledSelect
                control={control}
                name="deliveryOption"
                label={t('deliveryLabel')}
                options={deliveryOptions}
                disabled={requiresPickup}
              />
            </div>
            {requiresPickup && (
              <Text variant="muted" className="text-xs">
                {t('pickupForcedNote')}
              </Text>
            )}
            <ControlledTextarea
              control={control}
              name="note"
              label={t('noteLabel')}
              placeholder={t('notePlaceholder')}
            />
          </CardContent>
        </Card>
      </div>

      <OrderSummary
        items={items}
        subtotalVnd={subtotalVnd}
        totalVnd={subtotalVnd}
        shippingLabel={requiresPickup ? t('shippingLabelPickup') : t('shippingLabelGhn')}
        hint={t('orderHint')}
      />

      <div className="bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-muted-foreground text-xs">{t('totalLabel')}</p>
            <p className="font-heading text-2xl font-semibold">{formatVnd(subtotalVnd)}</p>
          </div>
          <Button type="submit" size="lg" disabled={formState.isSubmitting}>
            {tPaymentMethod(`${selectedMethod.value}.cta`)}
          </Button>
        </div>
      </div>
    </form>
  );
};
