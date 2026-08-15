import Link from 'next/link';

import { StaticPageShell } from '@/app/(storefront)/_components/StaticPageShell';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';

const GIFT_OPTIONS = [
  ['500,000 ₫', 'A first bag and a morning pastry'],
  ['1,000,000 ₫', 'Coffee, cake, and room for a workshop'],
  ['2,000,000 ₫', 'A proper gift for a coffee household'],
];

const GiftCardsPage = () => (
  <>
    <StaticPageShell
      eyebrow="Gifts · coffee, bread, time"
      title="Give them a morning at Bacama."
      description="Digital gift cards are coming soon. Until then, we can arrange a thoughtful coffee, pastry, or workshop gift by email."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {GIFT_OPTIONS.map(([amount, detail]) => (
          <Card key={amount}>
            <CardHeader>
              <p className="font-heading text-3xl">{amount}</p>
              <CardTitle className="mt-2 text-sm">{detail}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link href="/contact">Ask about this gift</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-14 max-w-2xl">
        <Heading as="h2" size="md">
          Not sure what they like?
        </Heading>
        <Text className="text-muted-foreground mt-4">
          Choose a gift card amount and tell us whether it is for coffee, a class, or a café
          morning. We will help you turn it into something personal while the digital system is
          being prepared.
        </Text>
        <Button asChild className="mt-7">
          <Link href="mailto:hang@bacama.vn?subject=Bacama%20gift">Email the roastery</Link>
        </Button>
      </div>
    </StaticPageShell>
    <Footer />
  </>
);

export default GiftCardsPage;
