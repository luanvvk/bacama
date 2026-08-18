import Link from 'next/link';

import {
  CORE_LINE_BEANS,
  CORE_LINE_VOLUME_TIERS,
  OEM_PRICING,
  SIGNATURE_LINE_BEANS,
  SIGNATURE_LINE_VOLUME_TIERS,
  type WholesaleVolumeTier,
} from '@/constants/wholesale';
import { formatVnd } from '@/lib/format-price';
import { StaticPageShell } from '@/app/(storefront)/_components/StaticPageShell';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

const VolumeTierTable = ({
  beans,
  tiers,
}: {
  beans: { slug: string; name: string }[];
  tiers: WholesaleVolumeTier[];
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Monthly volume</TableHead>
        {beans.map((bean) => (
          <TableHead key={bean.slug}>{bean.name}</TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {tiers.map((tier) => (
        <TableRow key={tier.volume}>
          <TableCell className="font-medium">{tier.volume}</TableCell>
          {beans.map((bean) => (
            <TableCell key={bean.slug}>
              {formatVnd(tier.pricesVnd[bean.slug]).replace(' ₫', '')}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const WholesalePage = () => (
  <>
    <StaticPageShell
      eyebrow="Wholesale · for cafés and kitchens"
      title="Real prices, real terms."
      description="1 kg bags, roasted to order, with volume pricing that improves as you order more. Reach us directly at 0934 856 938."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Core Line</CardTitle>
            <Text variant="muted" className="mt-1 text-sm">
              85–90% ripe cherry, natural process (washed for Arabica), 1 kg bags. For machine and
              traditional phin brewing, medium to dark.
            </Text>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bean</TableHead>
                  <TableHead>Process · size</TableHead>
                  <TableHead>Price / kg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CORE_LINE_BEANS.map((bean) => (
                  <TableRow key={bean.slug}>
                    <TableCell className="font-medium">{bean.name}</TableCell>
                    <TableCell className="text-muted-foreground">{bean.process}</TableCell>
                    <TableCell>{formatVnd(bean.priceVnd)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Text variant="muted" className="mt-3 text-xs">
              Prices exclude 8% VAT.
            </Text>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signature Line</CardTitle>
            <Text variant="muted" className="mt-1 text-sm">
              98–99% ripe cherry, honey/washed process, 1 kg bags. Our premium selection, for
              specialty espresso.
            </Text>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bean</TableHead>
                  <TableHead>Process · size</TableHead>
                  <TableHead>Price / kg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SIGNATURE_LINE_BEANS.map((bean) => (
                  <TableRow key={bean.slug}>
                    <TableCell className="font-medium">{bean.name}</TableCell>
                    <TableCell className="text-muted-foreground">{bean.process}</TableCell>
                    <TableCell>{formatVnd(bean.priceVnd)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Text variant="muted" className="mt-3 text-xs">
              Prices exclude 8% VAT.
            </Text>
          </CardContent>
        </Card>
      </div>

      <div className="mt-14">
        <Heading as="h2" size="md">
          Volume pricing (café channel)
        </Heading>
        <Text variant="muted" className="mt-2 max-w-2xl">
          Per-kg price improves automatically at higher monthly volumes — no separate negotiation
          needed.
        </Text>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-primary font-mono text-xs tracking-widest uppercase">Core Line</p>
            <div className="mt-3">
              <VolumeTierTable beans={CORE_LINE_BEANS} tiers={CORE_LINE_VOLUME_TIERS} />
            </div>
          </div>
          <div>
            <p className="text-primary font-mono text-xs tracking-widest uppercase">
              Signature Line
            </p>
            <div className="mt-3">
              <VolumeTierTable beans={SIGNATURE_LINE_BEANS} tiers={SIGNATURE_LINE_VOLUME_TIERS} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <div>
          <Heading as="h2" size="md">
            Contract roasting (OEM)
          </Heading>
          <Text variant="muted" className="mt-2">
            Roasted to your spec, unpackaged.
          </Text>
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Volume</TableHead>
                <TableHead>Price / kg</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {OEM_PRICING.map((tier) => (
                <TableRow key={tier.range}>
                  <TableCell className="font-medium">{tier.range}</TableCell>
                  <TableCell>{formatVnd(tier.pricePerKgVnd)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-accent rounded-lg p-6">
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            Delivery &amp; after-sales
          </p>
          <ul className="text-muted-foreground mt-4 space-y-3 text-sm">
            <li>
              Free delivery on orders of 10 kg or more; under 10 kg, a delivery-app fee applies.
            </li>
            <li>
              If a café closes, we buy back unopened stock at up to 50% of the original price,
              within 1 month of delivery.
            </li>
            <li>Ongoing support: roast consistency, machine cleaning, grinder maintenance.</li>
            <li>Espresso extraction guidance and barista training, on request.</li>
          </ul>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
        <div>
          <Heading as="h2" size="md">
            Payment &amp; credit terms
          </Heading>
          <ul className="text-muted-foreground mt-4 max-w-2xl space-y-3 text-sm">
            <li>Out-of-province orders: full prepayment by bank transfer before delivery.</li>
            <li>
              Regular customers ordering 30 kg/month or more can settle on credit — signed on
              receipt, closed on the 25th, paid by the 30th.
            </li>
            <li>
              VAT-invoice orders: pay 100% of the order plus 8% VAT upfront; the official e-invoice
              is issued the same business day (excluding weekends and holidays).
            </li>
          </ul>
          <Button asChild className="mt-7">
            <Link href="/contact">Start a wholesale conversation</Link>
          </Button>
        </div>
        <div className="bg-accent rounded-lg p-6">
          <p className="text-primary font-mono text-xs tracking-widest uppercase">Reach us</p>
          <ul className="text-muted-foreground mt-4 space-y-3 text-sm">
            <li>Hotline · 0934 856 938</li>
            <li>154/6 Lý Tự Trọng, Hải Châu, Đà Nẵng</li>
            <li>Roasting workshops · Thủy Yên, Chân Mây &amp; Lăng Cô, Huế</li>
          </ul>
        </div>
      </div>
    </StaticPageShell>
    <Footer />
  </>
);

export default WholesalePage;
