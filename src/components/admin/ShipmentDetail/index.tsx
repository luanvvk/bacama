import Link from 'next/link';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { AdminShipmentDetail } from '@/services/orders/admin-shipments';

import { shipmentStatusBadge } from '../shipment-status';

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export const ShipmentDetail = ({ shipment }: { shipment: AdminShipmentDetail }) => {
  const badge = shipmentStatusBadge(shipment.status);
  const events = [
    shipment.deliveredAt && { at: shipment.deliveredAt, title: 'Delivered' },
    shipment.shippedAt && { at: shipment.shippedAt, title: 'Handed to courier' },
    { at: shipment.createdAt, title: 'Shipment created' },
  ].filter((event): event is { at: Date; title: string } => Boolean(event));
  const { order } = shipment;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/shipments"
            className="text-primary font-mono text-xs tracking-widest uppercase"
          >
            ← Shipments
          </Link>
          <h1 className="font-heading mt-3 text-2xl font-semibold">
            {shipment.trackingNo ?? 'No tracking number'}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Order {order.ref} · {shipment.courierProvider}
          </p>
        </div>
        <Button disabled>Refresh tracking</Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-6">
              {events.map(({ at, title }, index) => (
                <li key={title} className="flex gap-4">
                  <span
                    className={`mt-1.5 size-3 shrink-0 rounded-full ${index === 0 ? 'bg-warning' : 'bg-muted'}`}
                  />
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-muted-foreground mt-1 font-mono text-xs">
                      {timeFormat.format(at)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-muted-foreground text-sm">
              Live courier tracking is not connected yet, so scans from the courier do not appear
              here.
            </p>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recipient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <p className="text-muted-foreground">{order.phone}</p>
              {(order.addressLine || order.province) && (
                <p>{[order.addressLine, order.province].filter(Boolean).join(', ')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
