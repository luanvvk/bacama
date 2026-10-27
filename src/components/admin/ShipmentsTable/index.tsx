'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import type { AdminShipmentFilter, AdminShipmentList } from '@/services/orders/admin-shipments';

import { shipmentStatusBadge } from '../shipment-status';

const FILTERS: { value: AdminShipmentFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'transit', label: 'In transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cod', label: 'COD' },
];

const updatedFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export const ShipmentsTable = ({
  data,
  filter,
  query,
}: {
  data: AdminShipmentList;
  filter: AdminShipmentFilter;
  query: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(query);
  const { shipments, summary } = data;

  const go = (next: { filter?: AdminShipmentFilter; q?: string }) => {
    const params = new URLSearchParams();
    const nextFilter = next.filter ?? filter;
    const nextQuery = next.q ?? query;
    if (nextFilter !== 'all') params.set('filter', nextFilter);
    if (nextQuery) params.set('q', nextQuery);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const cards: [string, number][] = [
    ['Awaiting pickup', summary.awaitingPickup],
    ['In transit', summary.inTransit],
    ['Delivered today', summary.deliveredToday],
    ['COD pending', summary.codPending],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Shipments</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Statuses are recorded by staff. Live courier tracking is not connected yet.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          Print list
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <Card size="sm" key={label}>
            <CardContent className="pt-4">
              <p className="text-muted-foreground font-mono text-xs uppercase">{label}</p>
              <p className="font-heading mt-2 text-2xl">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <form
              className="relative min-w-56 flex-1"
              onSubmit={(event) => {
                event.preventDefault();
                go({ q: search.trim() });
              }}
            >
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tracking, order or recipient…"
                aria-label="Search shipments"
                className="pl-9"
              />
            </form>
            <div className="flex gap-1 rounded-lg border p-1" aria-label="Filter shipments">
              {FILTERS.map(({ value, label }) => (
                <Button
                  key={value}
                  size="sm"
                  variant={filter === value ? 'secondary' : 'ghost'}
                  aria-pressed={filter === value}
                  onClick={() => go({ filter: value })}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Courier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last update</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground text-center">
                    No shipments match.
                  </TableCell>
                </TableRow>
              )}
              {shipments.map((shipment) => {
                const badge = shipmentStatusBadge(shipment.status);
                return (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-mono">{shipment.trackingNo ?? '—'}</TableCell>
                    <TableCell className="font-mono">{shipment.order.ref}</TableCell>
                    <TableCell>{shipment.order.customerName}</TableCell>
                    <TableCell>{shipment.courierProvider}</TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      {updatedFormat.format(shipment.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="ghost">
                        <Link
                          href={`/admin/shipments/${encodeURIComponent(shipment.trackingNo ?? shipment.id)}`}
                        >
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
