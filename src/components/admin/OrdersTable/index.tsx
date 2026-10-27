'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { OrderActionButton } from '@/components/admin/OrderActions';
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
import { formatVnd } from '@/lib/format-price';
import { toast } from '@/lib/toast';
import type { AdminOrderFilter, AdminOrderList } from '@/services/orders/admin-orders';

import { orderStatusBadge, paymentLabel } from '../order-status';

const FILTERS: { value: AdminOrderFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ack', label: 'To ack' },
  { value: 'cod', label: 'COD' },
  { value: 'failed', label: 'Failed' },
];

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const itemsSummary = (items: { nameSnapshot: string; quantity: number }[]) => {
  const [first, ...rest] = items;
  if (!first) return '—';
  const label =
    first.quantity > 1 ? `${first.nameSnapshot} × ${first.quantity}` : first.nameSnapshot;
  return rest.length > 0 ? `${label} +${rest.length} more` : label;
};

export const OrdersTable = ({
  data,
  filter,
  query,
}: {
  data: AdminOrderList;
  filter: AdminOrderFilter;
  query: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(query);
  const { orders, total, page, pageCount, oldestUnacknowledged } = data;

  const go = (next: { page?: number; filter?: AdminOrderFilter; q?: string }) => {
    const params = new URLSearchParams();
    const nextFilter = next.filter ?? filter;
    const nextQuery = next.q ?? query;
    if (nextFilter !== 'all') params.set('filter', nextFilter);
    if (nextQuery) params.set('q', nextQuery);
    if (next.page && next.page > 1) params.set('page', String(next.page));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Online orders</h1>
          <p className="text-muted-foreground mt-1 text-sm">{total} orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast('CSV export is not wired up yet.')}>
            Export CSV
          </Button>
          <Button onClick={() => window.print()}>Print pending</Button>
        </div>
      </div>

      {oldestUnacknowledged && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex flex-wrap items-center gap-3 py-4">
            <div className="flex-1 text-sm">
              <strong>
                Order {oldestUnacknowledged.ref} landed{' '}
                {timeFormat.format(oldestUnacknowledged.createdAt)}
              </strong>
              <span className="text-muted-foreground">
                {' '}
                · {paymentLabel(oldestUnacknowledged.paymentProvider)}{' '}
                {formatVnd(oldestUnacknowledged.totalVnd)} · unacknowledged
              </span>
            </div>
            <OrderActionButton size="sm" orderRef={oldestUnacknowledged.ref} action="acknowledge">
              Acknowledge
            </OrderActionButton>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <form
              className="relative min-w-56 flex-1"
              onSubmit={(event) => {
                event.preventDefault();
                go({ q: search.trim(), page: 1 });
              }}
            >
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Order, customer, phone…"
                aria-label="Search orders"
                className="pl-9"
              />
            </form>
            <div className="flex gap-1 rounded-lg border p-1" aria-label="Filter orders">
              {FILTERS.map(({ value, label }) => (
                <Button
                  key={value}
                  size="sm"
                  variant={filter === value ? 'secondary' : 'ghost'}
                  aria-pressed={filter === value}
                  onClick={() => go({ filter: value, page: 1 })}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const badge = orderStatusBadge(order);

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.ref}</TableCell>
                    <TableCell className="font-mono">
                      {timeFormat.format(order.createdAt)}
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{itemsSummary(order.items)}</TableCell>
                    <TableCell>{paymentLabel(order.paymentProvider)}</TableCell>
                    <TableCell className="font-mono">{formatVnd(order.totalVnd)}</TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/admin/orders/${encodeURIComponent(order.ref)}`}>
                          {order.status === 'awaiting_cod' ? 'Confirm COD' : 'View'}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {orders.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No orders match these filters.
            </p>
          )}
          {pageCount > 1 && (
            <div className="flex items-center justify-between text-sm">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => go({ page: page - 1 })}
              >
                Previous
              </Button>
              <span className="text-muted-foreground">
                Page {page} of {pageCount}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pageCount}
                onClick={() => go({ page: page + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
