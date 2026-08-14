'use client';

import { TriangleAlert } from 'lucide-react';

import { LOW_STOCK_ALERT } from '@/constants/admin';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';

export const LowStockBanner = () => (
  <div className="border-warning bg-warning/10 mb-6 flex flex-wrap items-center gap-3 rounded-lg border p-4 text-sm">
    <TriangleAlert className="text-warning size-5 shrink-0" aria-hidden="true" />
    <p className="min-w-52 flex-1">
      <b>{LOW_STOCK_ALERT.title}</b>{' '}
      <span className="text-muted-foreground">{LOW_STOCK_ALERT.detail}</span>
    </p>
    <Button
      type="button"
      size="sm"
      onClick={() => toast('Restocking flows land with the Admin catalogue group.')}
    >
      Update
    </Button>
  </div>
);
