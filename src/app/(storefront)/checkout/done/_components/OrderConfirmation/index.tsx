'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

import { getPaymentMethod } from '@/constants/checkout';
import { useCartStore } from '@/stores/cart';
import { useCheckoutStore } from '@/stores/checkout';
import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';

import { OrderSummary } from '../../../_components/OrderSummary';
import { OrderTracker } from '../OrderTracker';

export const OrderConfirmation = () => {
  const router = useRouter();
  const order = useCheckoutStore((state) => state.order);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (!order) {
      router.replace('/checkout');
      return;
    }

    clearCart();
  }, [order, router, clearCart]);

  if (!order) return null;

  const method = getPaymentMethod(order.paymentMethod);
  const isCod = method.kind === 'cod';
  const isPickup = order.shipping.deliveryOption === 'pickup';
  const firstName = order.shipping.fullName.trim().split(' ').pop();

  const trackerSteps = isPickup
    ? [
        { label: isCod ? 'Order placed' : 'Paid', detail: 'Today', done: true },
        { label: 'Preparing', detail: 'Today', done: true },
        { label: 'Ready for pickup', detail: 'Within 2 hours', done: false },
      ]
    : [
        { label: isCod ? 'Order placed' : 'Paid', detail: 'Today', done: true },
        { label: 'Roasting', detail: 'Tomorrow, 06:00', done: true },
        { label: 'GHN collects', detail: 'Tomorrow, 16:00', done: false },
        { label: 'Out for delivery', detail: 'Expected in 2–3 days', done: false },
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
          Thank you, {firstName}.
        </Heading>
        <Text variant="muted" className="mx-auto mt-3 max-w-prose">
          {isCod
            ? isPickup
              ? "We've received your order. Have the total ready when you collect it."
              : "We've received your order. Have the total ready for the courier on delivery."
            : "We've received your payment. We'll message you on Zalo with updates."}
        </Text>
        <p className="text-muted-foreground mt-4 font-mono text-xs tracking-widest uppercase">
          Order ref · {order.orderRef} · {method.label}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border p-4">
            <p className="font-heading text-base font-medium">
              {isPickup ? 'Where your order is' : 'Where your parcel is'}
            </p>
            <div className="mt-4">
              <OrderTracker steps={trackerSteps} />
            </div>
            <p className="text-muted-foreground mt-4 text-sm">
              {isPickup
                ? "We'll message you on Zalo the moment it's ready to collect at Lý Tự Trọng."
                : "Your coffee rides tomorrow morning's batch — packed as soon as it cools and shipped the same afternoon. The tracking number arrives over Zalo the moment GHN picks up."}
            </p>
          </div>

          <Button asChild size="lg" className="self-start">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </div>

        <OrderSummary
          items={order.items}
          subtotalVnd={order.subtotalVnd}
          totalVnd={order.totalVnd}
          totalLabel={isCod ? (isPickup ? 'Due on pickup' : 'Due on delivery') : 'Paid'}
          shippingLabel={isPickup ? 'Pickup' : 'Shipping · GHN'}
          shipToLabel={isPickup ? 'Contact' : 'Ship to'}
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
