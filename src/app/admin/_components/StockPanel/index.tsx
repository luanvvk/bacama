'use client';

import { useState } from 'react';
import Image from 'next/image';

import { STOCK_ITEMS } from '@/constants/admin';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export const StockPanel = () => {
  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(STOCK_ITEMS.map((item) => [item.id, item.quantity])),
  );

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Stock & roast date</CardTitle>
        <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          Site 01
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {STOCK_ITEMS.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <Image
              src={item.imageUrl}
              alt=""
              width={42}
              height={42}
              className="size-10 shrink-0 rounded-sm object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p
                className={cn(
                  'font-mono text-xs',
                  item.low ? 'text-warning' : 'text-muted-foreground',
                )}
              >
                {item.detail}
              </p>
            </div>
            <Input
              type="number"
              aria-label={`${item.name} stock`}
              value={quantities[item.id]}
              onChange={(event) =>
                setQuantities((current) => ({
                  ...current,
                  [item.id]: Number(event.target.value),
                }))
              }
              className={cn('w-16 text-center', item.low && 'border-warning')}
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => toast('Not wired up yet — stock edits need a backend.')}
        >
          Save changes
        </Button>
        <p className="text-muted-foreground text-xs">
          Online stock only. Café ingredients are the POS&rsquo;s job.
        </p>
      </CardContent>
    </Card>
  );
};
