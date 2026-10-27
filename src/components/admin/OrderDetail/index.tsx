import Link from 'next/link';

import { OrderActionButton, PrintButton } from '@/components/admin/OrderActions';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatVnd } from '@/lib/format-price';
import type { AdminOrderDetail } from '@/services/orders/admin-orders';

import { orderStatusBadge, paymentLabel } from '../order-status';

const dateTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh',
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const OrderDetail = ({ order }: { order: AdminOrderDetail }) => {
  const badge = orderStatusBadge(order);
  const canAcknowledge =
    !order.acknowledgedAt && (order.status === 'paid' || order.status === 'awaiting_cod');
  const canCollectCod = order.status === 'awaiting_cod' && order.paymentProvider === 'cod';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="text-primary font-mono text-xs tracking-widest uppercase"
          >
            ← Online orders
          </Link>
          <h1 className="font-heading mt-3 text-2xl font-semibold">Order {order.ref}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {order.pickupSite ? `${order.pickupSite.nameEn} · ` : ''}received{' '}
            {dateTime.format(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton>Print order</PrintButton>
          {canCollectCod && (
            <OrderActionButton orderRef={order.ref} action="collect-cod" variant="outline">
              Mark COD collected
            </OrderActionButton>
          )}
          {canAcknowledge && (
            <OrderActionButton orderRef={order.ref} action="acknowledge">
              Acknowledge
            </OrderActionButton>
          )}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{item.nameSnapshot}</p>
                    {(item.weight || item.grind) && (
                      <p className="text-muted-foreground text-sm">
                        {[item.weight, item.grind].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <span className="font-mono">
                    {item.quantity} × {formatVnd(item.unitPriceVnd)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-mono">{formatVnd(order.subtotalVnd)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery</span>
                <span className="font-mono">
                  {order.shippingVnd > 0 ? formatVnd(order.shippingVnd) : 'Free'}
                </span>
              </div>
              <div className="flex justify-between border-t pt-4 font-semibold">
                <span>Total</span>
                <span className="font-mono">{formatVnd(order.totalVnd)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {order.paidAt && (
                <div className="flex gap-3">
                  <span className="bg-success mt-1 size-2 rounded-full" />
                  <div>
                    <p className="font-medium">Payment received</p>
                    <p className="text-muted-foreground">
                      {paymentLabel(order.paymentProvider)} · {dateTime.format(order.paidAt)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <span
                  className={`mt-1 size-2 rounded-full ${order.acknowledgedAt ? 'bg-success' : 'bg-muted'}`}
                />
                <div>
                  <p className="font-medium">
                    {order.acknowledgedAt ? 'Acknowledged' : 'Awaiting acknowledgement'}
                  </p>
                  <p className="text-muted-foreground">
                    {order.acknowledgedAt
                      ? dateTime.format(order.acknowledgedAt)
                      : 'No staff action has been recorded.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{order.customerName}</p>
              {order.email && <p className="text-muted-foreground">{order.email}</p>}
              <p className="text-muted-foreground">{order.phone}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Badge variant={badge.variant}>{badge.label}</Badge>
              {order.deliveryMode === 'pickup' ? (
                <p>Pickup{order.pickupSite ? ` · ${order.pickupSite.nameEn}` : ''}</p>
              ) : (
                <p>
                  {order.addressLine}
                  <br />
                  {order.province}
                </p>
              )}
              {order.note && <p className="text-muted-foreground">{order.note}</p>}
              {order.shipment && (
                <p className="text-muted-foreground">
                  {order.shipment.courierProvider}
                  {order.shipment.trackingNo ? ` · ${order.shipment.trackingNo}` : ''}
                </p>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/shipments">View shipments</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
