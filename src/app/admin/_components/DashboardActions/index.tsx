'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/Button';

export const DashboardActions = () => (
  <div className="flex gap-2.5">
    <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
      Print today&rsquo;s orders
    </Button>
    <Button asChild size="sm">
      <Link href="/admin/catalog">Manage catalogue</Link>
    </Button>
  </div>
);
