import Link from 'next/link';

import { StaticPageShell } from '@/app/(storefront)/_components/StaticPageShell';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';

const PressPage = () => (
  <>
    <StaticPageShell
      eyebrow="Press · facts and files"
      title="A small story, told accurately."
      description="For press, partnerships, or a piece about coffee and baking in central Vietnam, start here."
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <Heading as="h2" size="md">
            Bacama in brief
          </Heading>
          <Text className="text-muted-foreground mt-4">
            Bacama is a small roastery, bakery, café group, and online learning studio based in Đà
            Nẵng. We roast Vietnamese coffee in daily batches, bake western pastries in the morning,
            and teach coffee and baking beside the machines.
          </Text>
          <Text className="text-muted-foreground mt-4">
            Founded in 2017. Sites in Đà Nẵng and Hội An. Third site opening in September 2026.
          </Text>
          <Button asChild className="mt-7">
            <Link href="mailto:hang@bacama.vn?subject=Press%20enquiry">Contact for press</Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Quick facts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Founded</span>
              <span className="font-mono">2017</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Based in</span>
              <span>Đà Nẵng</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Focus</span>
              <span>Coffee · bread · learning</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Press email</span>
              <span>hang@bacama.vn</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </StaticPageShell>
    <Footer />
  </>
);

export default PressPage;
