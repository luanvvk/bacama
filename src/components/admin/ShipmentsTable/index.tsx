'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
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
import { toast } from '@/lib/toast';

const SHIPMENTS = [
  {
    id: '01',
    tracking: 'GHNVD-78213',
    order: '#2417',
    recipient: 'Trần Đức Khôi',
    courier: 'GHN',
    status: 'Out for delivery',
    variant: 'warning' as const,
    updated: '14:08',
  },
  {
    id: '02',
    tracking: 'GHNVD-78212',
    order: '#2416',
    recipient: 'Nguyễn Thu Hà',
    courier: 'GHN',
    status: 'At sorting hub',
    variant: 'outline' as const,
    updated: '10:42',
  },
  {
    id: '03',
    tracking: 'GHTK-9D2K0',
    order: '#2411',
    recipient: 'Phạm Minh Anh',
    courier: 'GHTK',
    status: 'Delivered',
    variant: 'success' as const,
    updated: '09 Aug',
  },
  {
    id: '04',
    tracking: 'GHNVD-78211',
    order: '#2409',
    recipient: 'Lê Thị Ngọc',
    courier: 'GHN',
    status: 'Delivered',
    variant: 'success' as const,
    updated: '08 Aug',
  },
  {
    id: '05',
    tracking: 'AH-N9XPK',
    order: '#2407',
    recipient: 'Yuuki Tanaka',
    courier: 'Ahamove',
    status: 'Delivered · same-day',
    variant: 'success' as const,
    updated: '07 Aug',
  },
  {
    id: '06',
    tracking: 'GR-EA22P',
    order: '#2413',
    recipient: 'Đặng Bảo Khang',
    courier: 'GrabExpress',
    status: 'Delivered · fresh pastries',
    variant: 'success' as const,
    updated: '07:36',
  },
];

type ShipmentFilter = 'all' | 'transit' | 'delivered' | 'cod';

export const ShipmentsTable = () => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ShipmentFilter>('all');

  const shipments = SHIPMENTS.filter((shipment) => {
    const matchesQuery = `${shipment.tracking} ${shipment.order} ${shipment.recipient}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'transit'
        ? shipment.status !== 'Delivered' && !shipment.status.includes('Delivered')
        : filter === 'delivered'
          ? shipment.status.includes('Delivered')
          : shipment.order === '#2416');
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            GHN · GHTK · Ahamove · Grab
          </p>
          <h1 className="font-heading mt-2 text-2xl font-semibold">Shipments</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            9 parcels in transit · 1 awaiting pickup · 1 COD pending · 0 failed
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            Print GHN labels
          </Button>
          <Button onClick={() => toast('The 16:00 pickup has not been scheduled.')}>
            Schedule 16:00 pickup
          </Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Awaiting GHN', '1', 'collects 16:00'],
          ['In transit', '7', 'avg 1.8 days'],
          ['Delivered today', '1', '14:08'],
          ['COD pending', '1', '#2416 · 720,000 ₫'],
        ].map(([label, value, detail]) => (
          <Card size="sm" key={label}>
            <CardContent className="pt-4">
              <p className="text-muted-foreground font-mono text-xs uppercase">{label}</p>
              <p className="font-heading mt-2 text-2xl">{value}</p>
              <p className="text-muted-foreground text-xs">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
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
                placeholder="Tracking or order number…"
                aria-label="Search shipments"
                className="pl-9"
              />
            </div>
            <div className="flex gap-1 rounded-lg border p-1" aria-label="Filter shipments">
              {(['all', 'transit', 'delivered', 'cod'] as const).map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={filter === value ? 'secondary' : 'ghost'}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {value === 'all'
                    ? 'All'
                    : value === 'transit'
                      ? 'In transit'
                      : value === 'delivered'
                        ? 'Delivered'
                        : 'COD'}
                </Button>
              ))}
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
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
              {shipments.map((shipment) => (
                <TableRow key={shipment.tracking}>
                  <TableCell className="font-mono">{shipment.id}</TableCell>
                  <TableCell className="font-mono">{shipment.tracking}</TableCell>
                  <TableCell className="font-mono">{shipment.order}</TableCell>
                  <TableCell>{shipment.recipient}</TableCell>
                  <TableCell>{shipment.courier}</TableCell>
                  <TableCell>
                    <Badge variant={shipment.variant}>{shipment.status}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">{shipment.updated}</TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/shipments/${shipment.tracking}`}>Track</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="grid gap-5 py-5 sm:grid-cols-4">
          {[
            ['Morning', '08:30', 'GHTK · nationwide'],
            ['Noon', '12:00', 'Ahamove · Da Nang'],
            ['Afternoon', '16:00', 'GHN · main run'],
            ['Grab', 'On demand', 'fresh pastries'],
          ].map(([label, time, detail]) => (
            <div key={label}>
              <p className="text-muted-foreground font-mono text-xs uppercase">{label}</p>
              <p className="font-heading mt-1 text-xl">{time}</p>
              <p className="text-muted-foreground mt-1 text-xs">{detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
