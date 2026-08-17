import Link from 'next/link';

import { StaticPageShell } from '@/app/(storefront)/_components/StaticPageShell';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';

const CareersPage = () => (
  <>
    <StaticPageShell
      eyebrow="Work with us · Đà Nẵng & Hội An"
      title="Good work is made by good people."
      description="We are a small team across the roastery, bakery, cafés, and classroom. We care about craft, clear shifts, and leaving the place better than we found it."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <p className="text-primary font-mono text-xs tracking-widest uppercase">
              Open role · Site 01
            </p>
            <CardTitle>Barista / café team</CardTitle>
          </CardHeader>
          <CardContent>
            <Text variant="muted">
              Full-time or weekend shifts. Experience helps; curiosity and care matter more.
            </Text>
            <Button asChild variant="outline" className="mt-5">
              <Link href="mailto:hang@bacama.vn?subject=Barista%20application">
                Ask about the role
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-primary font-mono text-xs tracking-widest uppercase">
              Open role · Site 02
            </p>
            <CardTitle>Weekend workshop assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <Text variant="muted">
              Help prepare materials, welcome students, and keep the classroom calm and ready.
            </Text>
            <Button asChild variant="outline" className="mt-5">
              <Link href="mailto:hang@bacama.vn?subject=Workshop%20application">
                Ask about the role
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-14 max-w-2xl">
        <Heading as="h2" size="md">
          No matching role?
        </Heading>
        <Text className="text-muted-foreground mt-4">
          Send a short note with what you do well, where you are based, and the kind of work you
          want to learn. We keep good introductions on file.
        </Text>
        <Button asChild className="mt-7">
          <Link href="mailto:hang@bacama.vn?subject=Working%20at%20Bacama">Introduce yourself</Link>
        </Button>
      </div>
    </StaticPageShell>
    <Footer />
  </>
);

export default CareersPage;
