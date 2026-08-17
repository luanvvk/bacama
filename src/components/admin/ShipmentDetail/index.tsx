'use client';

import Link from 'next/link';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { toast } from '@/lib/toast';

export const ShipmentDetail = ({ tracking }: { tracking: string }) => (
  <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <Link
          href="/admin/shipments"
          className="text-primary font-mono text-xs tracking-widest uppercase"
        >
          ← Shipments
        </Link>
        <h1 className="font-heading mt-3 text-2xl font-semibold">{tracking}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Order #2417 · GHN · Site 01 Ngô Quyền</p>
      </div>
      <Button onClick={() => toast('Live courier tracking is not wired up yet.')}>
        Refresh tracking
      </Button>
    </div>
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle>Tracking timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-6">
            {[
              ['14:08 today', 'Out for delivery', 'Courier is heading to the recipient.'],
              ['10:42 today', 'At sorting hub', 'Parcel arrived at the Da Nang sorting hub.'],
              ['08:12 today', 'Picked up', 'GHN collected the parcel from Site 01.'],
              ['Yesterday · 17:30', 'Label created', 'Shipment created from order #2417.'],
            ].map(([time, title, description], index) => (
              <li key={title} className="flex gap-4">
                <span
                  className={`mt-1.5 size-3 shrink-0 rounded-full ${index === 0 ? 'bg-warning' : 'bg-muted'}`}
                />
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-muted-foreground text-sm">{description}</p>
                  <p className="text-muted-foreground mt-1 font-mono text-xs">{time}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant="warning">Out for delivery</Badge>
            <p className="text-muted-foreground text-sm">Estimated delivery today before 18:00.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recipient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">Trần Đức Khôi</p>
            <p className="text-muted-foreground">0905 555 117</p>
            <p>
              14 Nguyễn Văn Linh
              <br />
              Hải Châu, Đà Nẵng
            </p>
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() => toast('Courier contact is not wired up yet.')}
            >
              Contact courier
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
