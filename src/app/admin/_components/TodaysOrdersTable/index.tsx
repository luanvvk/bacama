import { orderStatusBadge, paymentLabel } from '@/components/admin/order-status';
import { formatVnd } from '@/lib/format-price';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import type { AdminTodayOrder } from '@/services/orders/admin-orders';

const itemsSummary = (items: AdminTodayOrder['items']) => {
  const [first, ...rest] = items;
  if (!first) return '—';
  const label =
    first.quantity > 1 ? `${first.nameSnapshot} × ${first.quantity}` : first.nameSnapshot;
  return rest.length > 0 ? `${label} +${rest.length} more` : label;
};

export const TodaysOrdersTable = ({ orders }: { orders: AdminTodayOrder[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Today&rsquo;s orders</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ref</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground text-center">
                No orders yet today.
              </TableCell>
            </TableRow>
          )}
          {orders.map((order) => {
            const badge = orderStatusBadge(order);
            return (
              <TableRow key={order.ref}>
                <TableCell className="font-mono">{order.ref}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{itemsSummary(order.items)}</TableCell>
                <TableCell>{paymentLabel(order.paymentProvider)}</TableCell>
                <TableCell className="text-right font-mono">{formatVnd(order.totalVnd)}</TableCell>
                <TableCell>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);
