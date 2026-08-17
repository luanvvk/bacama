import { TODAYS_ORDERS } from '@/constants/admin';
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

export const TodaysOrdersTable = () => (
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
          {TODAYS_ORDERS.map((order) => (
            <TableRow key={order.ref}>
              <TableCell className="font-mono">{order.ref}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.items}</TableCell>
              <TableCell>{order.payment}</TableCell>
              <TableCell className="text-right font-mono">{formatVnd(order.totalVnd)}</TableCell>
              <TableCell>
                <Badge variant={order.statusVariant}>{order.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);
