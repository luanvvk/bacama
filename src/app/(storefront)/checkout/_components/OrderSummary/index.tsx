import Image from 'next/image';
import { type ReactNode } from 'react';

import { type CartItem } from '@/stores/cart';
import { formatVnd } from '@/lib/format-price';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';

export interface OrderSummaryShipTo {
  name: string;
  phone: string;
  address: string;
}

export interface OrderSummaryProps {
  title?: string;
  items: CartItem[];
  subtotalVnd: number;
  totalVnd: number;
  totalLabel?: string;
  showBreakdown?: boolean;
  shipTo?: OrderSummaryShipTo;
  hint?: ReactNode;
  className?: string;
}

export const OrderSummary = ({
  title = 'Your order',
  items,
  subtotalVnd,
  totalVnd,
  totalLabel = 'Total',
  showBreakdown = true,
  shipTo,
  hint,
  className,
}: OrderSummaryProps) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            {item.imageUrl && (
              <Image
                src={item.imageUrl}
                alt=""
                width={56}
                height={56}
                className="size-14 shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-sm font-medium">{item.name}</p>
              {item.options && (
                <p className="text-muted-foreground text-xs">
                  {item.options} · × {item.quantity}
                </p>
              )}
            </div>
            <span className="font-mono text-sm font-semibold tabular-nums">
              {formatVnd(item.priceVnd * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <Separator />

      <div className="flex flex-col gap-2 text-sm">
        {showBreakdown && (
          <>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono">{formatVnd(subtotalVnd)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Shipping · GHN</span>
              <span className="text-success font-mono">Free</span>
            </div>
          </>
        )}
        <div className="flex justify-between text-base font-semibold">
          <span>{totalLabel}</span>
          <span className="font-mono">{formatVnd(totalVnd)}</span>
        </div>
      </div>

      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}

      {shipTo && (
        <>
          <Separator />
          <div>
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              Ship to
            </p>
            <p className="mt-1.5 text-sm">
              {shipTo.name} · {shipTo.phone}
              <br />
              {shipTo.address}
            </p>
          </div>
        </>
      )}
    </CardContent>
  </Card>
);
