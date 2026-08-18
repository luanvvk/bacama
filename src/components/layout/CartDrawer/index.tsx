'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';

import { useCartStore, useCartTotalVnd } from '@/stores/cart';
import { Button } from '@/components/ui/Button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/Sheet';
import { QuantityStepper } from '@/components/shop/QuantityStepper';
import { formatVnd } from '@/lib/format-price';

const FREE_SHIPPING_THRESHOLD_VND = 500000;

export const CartDrawer = () => {
  const isOpen = useCartStore((state) => state.isOpen);
  const close = useCartStore((state) => state.close);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const subtotalVnd = useCartTotalVnd();

  // A bakery/drink item in the cart forces the whole order to pickup at
  // checkout (see CheckoutForm) — no GHN shipping applies, so the nationwide
  // shipping copy below would be misleading.
  const requiresPickup = items.some((item) => item.kind === 'bakery' || item.kind === 'menu');
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_VND - subtotalVnd);
  const shippingValueLabel = remainingForFreeShipping === 0 ? 'Free' : formatVnd(0);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : close())}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your basket</SheetTitle>
          <SheetDescription className="sr-only">Items in your shopping cart</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <p className="bg-muted mb-4 rounded-lg px-3 py-2 text-sm">
            {requiresPickup ? (
              'Bakery items and drinks are pickup-only — the whole order will be collected at Lý Tự Trọng.'
            ) : remainingForFreeShipping === 0 ? (
              'You qualify for free shipping.'
            ) : (
              <>
                Add <b>{formatVnd(remainingForFreeShipping)}</b> more for free shipping.
              </>
            )}
          </p>

          {items.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">Your basket is empty.</p>
          )}

          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    width={64}
                    height={64}
                    className="size-16 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  {item.options && <p className="text-muted-foreground text-xs">{item.options}</p>}
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(quantity) => updateQuantity(item.id, quantity)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeItem(item.id)}
                    >
                      <X />
                    </Button>
                  </div>
                </div>
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {formatVnd(item.priceVnd * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <SheetFooter className="border-t">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-mono font-semibold">{formatVnd(subtotalVnd)}</span>
          </div>
          <div className="text-muted-foreground flex justify-between text-sm">
            <span>{requiresPickup ? 'Pickup' : 'Shipping · GHN'}</span>
            <span className="font-mono">{shippingValueLabel}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total</span>
            <span className="font-mono">{formatVnd(subtotalVnd)}</span>
          </div>
          {items.length === 0 ? (
            <Button size="lg" className="mt-2 w-full" disabled>
              Check out
            </Button>
          ) : (
            <Button asChild size="lg" className="mt-2 w-full" onClick={close}>
              <Link href="/checkout">Check out</Link>
            </Button>
          )}
          <p className="text-muted-foreground text-center text-xs">
            ZaloPay · MoMo · VNPay QR · COD
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
