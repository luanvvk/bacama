import Link from 'next/link';

import { StaticPageShell } from '@/app/(storefront)/_components/StaticPageShell';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';

const WholesalePage = () => (
  <>
    <StaticPageShell
      eyebrow="Wholesale · for cafés and kitchens"
      title="Coffee that fits your counter."
      description="Freshly roasted Vietnamese coffee, practical brew guidance, and a person you can actually reach when the menu changes."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {[
          [
            '01',
            'Choose a house profile',
            'Start with House Blend, Đà Lạt Washed, or Sơn La Natural. We can help match a roast to your menu.',
          ],
          [
            '02',
            'Order in 1 kg bags',
            'Whole bean or a grind prepared for your equipment. Every bag carries its roast date.',
          ],
          [
            '03',
            'Build a rhythm',
            'Regular orders, seasonal lots, and straightforward delivery across Đà Nẵng and nationwide.',
          ],
        ].map(([number, title, description]) => (
          <Card key={number}>
            <CardHeader>
              <p className="text-primary font-mono text-xs">{number}</p>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Text variant="muted">{description}</Text>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
        <div>
          <Heading as="h2" size="md">
            A small roastery, not a catalogue.
          </Heading>
          <Text className="text-muted-foreground mt-4 max-w-2xl">
            We work best with cafés that care about consistency and want to know where the coffee
            comes from. Tell us how you brew, how much you use, and what your customers like. We
            will suggest a starting point without forcing a fixed package.
          </Text>
          <Button asChild className="mt-7">
            <Link href="/contact">Start a wholesale conversation</Link>
          </Button>
        </div>
        <div className="bg-accent rounded-lg p-6">
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            Wholesale notes
          </p>
          <ul className="text-muted-foreground mt-4 space-y-3 text-sm">
            <li>Minimum starting order · 5 kg</li>
            <li>Delivery · GHN or local courier</li>
            <li>Response time · within one business day</li>
          </ul>
        </div>
      </div>
    </StaticPageShell>
    <Footer />
  </>
);

export default WholesalePage;
