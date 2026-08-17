'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  DELIVERY_OPTIONS,
  PROVINCES,
  PAYMENT_METHODS,
  getPaymentMethod,
} from '@/constants/checkout';
import { formatVnd } from '@/lib/format-price';
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
import { checkoutSchema, type CheckoutFormValues } from './schema';

const PAYMENT_METHOD_OPTIONS = PAYMENT_METHODS.map((method) => ({
  value: method.value,
  label: method.label,
  description: method.description,
  meta: method.meta,
}));

const PROVINCE_OPTIONS = PROVINCES.map((province) => ({ label: province, value: province }));

export const CheckoutForm = () => {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotalVnd = useCartTotalVnd();
  const existingOrder = useCheckoutStore((state) => state.order);
  const placeOrder = useCheckoutStore((state) => state.placeOrder);

  const { control, handleSubmit, formState } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: existingOrder?.paymentMethod ?? 'zalopay',
      fullName: existingOrder?.shipping.fullName ?? '',
      phone: existingOrder?.shipping.phone ?? '',
      address: existingOrder?.shipping.address ?? '',
      province: existingOrder?.shipping.province ?? PROVINCES[0],
      deliveryOption: existingOrder?.shipping.deliveryOption ?? DELIVERY_OPTIONS[0].value,
      note: existingOrder?.shipping.note ?? '',
    },
  });

  const selectedMethod = getPaymentMethod(useWatch({ control, name: 'paymentMethod' }));

  useEffect(() => {
    if (items.length === 0) router.replace('/shop');
  }, [items.length, router]);

  if (items.length === 0) return null;

  const onSubmit = (values: CheckoutFormValues) => {
    const { paymentMethod, fullName, phone, address, province, deliveryOption, note } = values;

    placeOrder({
      items,
      subtotalVnd,
      totalVnd: subtotalVnd,
      paymentMethod,
      shipping: { fullName, phone, address, province, deliveryOption, note },
    });

    router.push(
      getPaymentMethod(paymentMethod).kind === 'cod' ? '/checkout/done' : '/checkout/pay',
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-8 pb-28 lg:grid-cols-[1.4fr_1fr] lg:gap-14"
    >
      <div className="flex flex-col gap-8">
        <div>
          <Heading as="h1" size="lg">
            How would you like to pay?
          </Heading>
          <Text variant="muted" className="mt-2 max-w-prose">
            Pick one below. We never store your card details — every payment happens on the
            provider&rsquo;s own page.
          </Text>
          <div className="mt-6">
            <ControlledRadioGroup
              control={control}
              name="paymentMethod"
              options={PAYMENT_METHOD_OPTIONS}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Where should it go?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ControlledInput control={control} name="fullName" label="Full name" />
              <ControlledInput control={control} name="phone" label="Phone" />
            </div>
            <ControlledInput control={control} name="address" label="Address" />
            <div className="grid gap-4 sm:grid-cols-2">
              <ControlledSelect
                control={control}
                name="province"
                label="Province / City"
                options={PROVINCE_OPTIONS}
              />
              <ControlledSelect
                control={control}
                name="deliveryOption"
                label="How to receive"
                options={DELIVERY_OPTIONS}
              />
            </div>
            <ControlledTextarea
              control={control}
              name="note"
              label="Note for the shop"
              placeholder="e.g. grind for phin, deliver in the afternoon…"
            />
          </CardContent>
        </Card>
      </div>

      <OrderSummary
        items={items}
        subtotalVnd={subtotalVnd}
        totalVnd={subtotalVnd}
        hint="Your coffee is roasted before it ships. Today's order rides tomorrow's batch."
      />

      <div className="bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-muted-foreground text-xs">Total</p>
            <p className="font-heading text-2xl font-semibold">{formatVnd(subtotalVnd)}</p>
          </div>
          <Button type="submit" size="lg" disabled={formState.isSubmitting}>
            {selectedMethod.cta}
          </Button>
        </div>
      </div>
    </form>
  );
};
