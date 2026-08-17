'use client';

import Link from 'next/link';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatVnd } from '@/lib/format-price';
import { toast } from '@/lib/toast';

export const OrderDetail = ({ reference }: { reference: string }) => (
  <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <Link
          href="/admin/orders"
          className="text-primary font-mono text-xs tracking-widest uppercase"
        >
          ← Online orders
        </Link>
        <h1 className="font-heading mt-3 text-2xl font-semibold">Order {reference}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Today · Site 01 Ngô Quyền · received 10:24
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.print()}>
          Print order
        </Button>
        <Button onClick={() => toast(`Order ${reference} acknowledgement is not persisted yet.`)}>
          Acknowledge
        </Button>
      </div>
    </div>
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">Đà Lạt Washed</p>
                <p className="text-muted-foreground text-sm">250 g · Whole bean</p>
              </div>
              <span className="font-mono">2 × {formatVnd(255000)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-mono">{formatVnd(510000)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery · GHN</span>
              <span className="font-mono">Free</span>
            </div>
            <div className="flex justify-between border-t pt-4 font-semibold">
              <span>Total</span>
              <span className="font-mono">{formatVnd(510000)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex gap-3">
              <span className="bg-success mt-1 size-2 rounded-full" />
              <div>
                <p className="font-medium">Payment received</p>
                <p className="text-muted-foreground">ZaloPay · 10:24 today</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="bg-muted mt-1 size-2 rounded-full" />
              <div>
                <p className="font-medium">Awaiting acknowledgement</p>
                <p className="text-muted-foreground">No staff action has been recorded.</p>
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
            <p className="font-medium">Lê Thị Ngọc</p>
            <p className="text-muted-foreground">ngoc.le@email.vn</p>
            <p className="text-muted-foreground">0905 123 456</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Badge variant="warning">To acknowledge</Badge>
            <p>
              27 Ngô Quyền, Hải Châu
              <br />
              Đà Nẵng
            </p>
            <p className="text-muted-foreground">GHN · tracking created after acknowledgement</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/shipments">View shipments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
