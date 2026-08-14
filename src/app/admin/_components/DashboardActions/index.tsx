'use client';

import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';

export const DashboardActions = () => (
  <div className="flex gap-2.5">
    <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
      Print today&rsquo;s orders
    </Button>
    <Button
      type="button"
      size="sm"
      onClick={() =>
        toast("New product isn't wired up yet — coming with the Admin catalogue group.")
      }
    >
      + New product
    </Button>
  </div>
);
