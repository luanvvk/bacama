import Link from 'next/link';

import { StaticPageShell } from '@/app/(storefront)/_components/StaticPageShell';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';

const ShippingReturnsPage = () => (
  <>
    <StaticPageShell
      eyebrow="Shipping & returns · nationwide"
      title="From our oven to your door."
      description="We pack coffee carefully, ship quickly, and would rather solve a problem than hide behind a policy."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {[
          [
            '01',
            'Dispatch',
            'Orders leave within 24 hours of roasting. Bakery items are available for local collection or same-day delivery only.',
          ],
          [
            '02',
            'Delivery',
            'GHN delivers nationwide in 2–3 days. Ahamove and GrabExpress cover Da Nang and nearby areas. Free shipping starts at 500,000 ₫.',
          ],
          [
            '03',
            'If something goes wrong',
            'Send us a photo within 48 hours of delivery. Damaged, missing, or incorrect items are replaced or refunded.',
          ],
        ].map(([number, title, body]) => (
          <Card key={number}>
            <CardHeader>
              <p className="text-primary font-mono text-xs">{number}</p>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Text variant="muted">{body}</Text>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <div>
          <Heading as="h2" size="md">
            Coffee returns
          </Heading>
          <Text className="text-muted-foreground mt-4">
            Coffee is freshest when it reaches you, so unopened coffee can be returned within 14
            days. Once opened, contact us anyway if it is not right — we will help you troubleshoot
            the brew before deciding what comes next.
          </Text>
        </div>
        <div>
          <Heading as="h2" size="md">
            Courses and bookings
          </Heading>
          <Text className="text-muted-foreground mt-4">
            Online course enrolments can be cancelled before the first lesson is watched. In-person
            classes can be moved to another date with 7 days&apos; notice, subject to availability.
          </Text>
        </div>
      </div>
      <Button asChild variant="outline" className="mt-10">
        <Link href="/contact">Ask about an order</Link>
      </Button>
    </StaticPageShell>
    <Footer />
  </>
);

export default ShippingReturnsPage;
