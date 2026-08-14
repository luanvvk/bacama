import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';
import { Container } from '@/components/layout/Container';

export const StorySection = () => (
  <section className="dark bg-background border-t">
    <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div className="relative aspect-4/5 overflow-hidden rounded-lg">
        <Image
          src="https://images.unsplash.com/photo-1447934143428-44e0ad3a4bc1?auto=format&fit=crop&w=900&q=72"
          alt="The roastery in early morning light"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div>
        <p className="text-primary font-mono text-xs tracking-widest uppercase">
          02 · Our family · since 2017
        </p>
        <Heading as="h2" size="lg" className="mt-3 max-w-md">
          It began with my grandmother&apos;s pan.
        </Heading>
        <Text variant="lead" className="text-muted-foreground mt-5 max-w-prose">
          She roasted coffee for the family every morning. My mother baked bread for the neighbours.
          We opened the roastery in 2017 — one kitchen, one oven, one family outside Đà Nẵng.
        </Text>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/story">Read our story</Link>
        </Button>
      </div>
    </Container>
  </section>
);
