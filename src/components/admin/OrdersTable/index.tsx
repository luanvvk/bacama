'use client';

import { Search } from 'lucide-react';
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
import { formatVnd } from '@/lib/format-price';
import { toast } from '@/lib/toast';

const ORDERS = [
  {
    ref: '#2419',
    time: '10:24',
    customer: 'Lê Thị Ngọc',
    items: '2 coffee bags',
    payment: 'ZaloPay',
    total: 510000,
    status: 'To acknowledge',
    variant: 'warning' as const,
  },
  {
    ref: '#2418',
    time: '09:51',
    customer: 'Oliver Brandt',
    items: 'Sơn La Natural 250 g',
    payment: 'Visa',
    total: 265000,
    status: 'Payment failed',
    variant: 'destructive' as const,
  },
  {
    ref: '#2417',
    time: '09:22',
    customer: 'Trần Đức Khôi',
    items: 'House Blend 250 g × 2',
    payment: 'MoMo',
    total: 460000,
    status: 'Shipped',
    variant: 'success' as const,
  },
  {
    ref: '#2416',
    time: '08:48',
    customer: 'Nguyễn Thu Hà',
    items: 'Three Origins Box',
    payment: 'COD',
    total: 720000,
    status: 'Awaiting COD',
    variant: 'warning' as const,
  },
  {
    ref: '#2415',
    time: '08:11',
    customer: 'Phạm Minh Anh',
    items: 'Latte Art course',
    payment: 'ZaloPay',
    total: 790000,
    status: 'Enrolled',
    variant: 'success' as const,
  },
  {
    ref: '#2414',
    time: '07:36',
    customer: 'Yuuki Tanaka',
    items: 'Đà Lạt Washed 1 kg',
    payment: 'Bank',
    total: 780000,
    status: 'Awaiting transfer',
    variant: 'warning' as const,
  },
  {
    ref: '#2413',
    time: '07:14',
    customer: 'Đặng Bảo Khang',
    items: 'Croissant × 6',
    payment: 'GrabFood',
    total: 270000,
    status: 'Handed to Grab',
    variant: 'success' as const,
  },
];

type OrderFilter = 'all' | 'ack' | 'cod' | 'failed';

export const OrdersTable = () => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [acknowledged, setAcknowledged] = useState(false);

  const orders = ORDERS.filter((order) => {
    const matchesQuery = `${order.ref} ${order.customer} ${order.items}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'ack'
        ? order.status === 'To acknowledge'
        : filter === 'cod'
          ? order.payment === 'COD'
          : order.status === 'Payment failed');
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            Today · 13 Aug 2026 · refreshed 10:24
          </p>
          <h1 className="font-heading mt-2 text-2xl font-semibold">Online orders</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            14 orders · 9 paid · 3 COD · 1 failed · 1 pending
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast('CSV export is not wired up yet.')}>
            Export CSV
          </Button>
          <Button onClick={() => window.print()}>Print pending</Button>
        </div>
      </div>

      {!acknowledged && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex flex-wrap items-center gap-3 py-4">
            <div className="flex-1 text-sm">
              <strong>Order #2419 landed at 10:24</strong>
              <span className="text-muted-foreground">
                {' '}
                · ZaloPay {formatVnd(510000)} · unacknowledged
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setAcknowledged(true);
                toast('Order #2419 acknowledged.');
              }}
            >
              Acknowledge
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-56 flex-1">
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Order, customer, phone…"
                aria-label="Search orders"
                className="pl-9"
              />
            </div>
            <div className="flex gap-1 rounded-lg border p-1" aria-label="Filter orders">
              {(['all', 'ack', 'cod', 'failed'] as const).map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={filter === value ? 'secondary' : 'ghost'}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {value === 'all'
                    ? 'All'
                    : value === 'ack'
                      ? 'To ack'
                      : value === 'cod'
                        ? 'COD'
                        : 'Failed'}
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
              {orders.map((order) => (
                <TableRow key={order.ref}>
                  <TableCell className="font-mono">{order.ref}</TableCell>
                  <TableCell className="font-mono">{order.time}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell>{order.payment}</TableCell>
                  <TableCell className="font-mono">{formatVnd(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant={order.variant}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        toast(
                          order.status === 'Payment failed'
                            ? `Refund request for ${order.ref} is not wired up yet.`
                            : `${order.ref} actions are not wired up yet.`,
                        )
                      }
                    >
                      {order.status === 'Payment failed'
                        ? 'Refund'
                        : order.status === 'To acknowledge'
                          ? 'Open'
                          : order.payment === 'COD'
                            ? 'Confirm COD'
                            : 'View'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {orders.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No orders match these filters.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
