import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Typography';
import { Container } from '@/components/layout/Container';

export const HeroSection = () => (
  <section className="py-12 sm:py-16">
    <Container className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div>
        <p className="text-primary font-mono text-xs tracking-widest uppercase">
          Roastery · Đà Nẵng · since 2017
        </p>
        <h1 className="font-heading mt-3 text-4xl sm:text-5xl">
          Roasted by hand, <em className="italic">baked before the light.</em>
        </h1>
        <Text variant="lead" className="text-muted-foreground mt-4 max-w-prose">
          A small roastery outside Đà Nẵng. Coffee roasted in daily batches, a roast date on every
          bag. Western pastries made with French butter.
        </Text>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/shop">Shop the roast</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/courses">Take a workshop</Link>
          </Button>
        </div>
        <div className="text-muted-foreground mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6 text-sm">
          <span>
            Two cafés today · <b className="text-foreground">Đà Nẵng, Hội An</b>
          </span>
          <span>Daily batch roasting</span>
          <span>ZaloPay · MoMo · COD</span>
        </div>
      </div>
      <div className="relative aspect-4/5 overflow-hidden rounded-lg">
        <Image
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=72"
          alt="Freshly baked almond croissant"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="bg-background/95 absolute top-4 right-4 rounded-lg px-3 py-2 text-center shadow-md">
          <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            Roasted
          </p>
          <p className="font-heading text-sm">Fresh daily</p>
        </div>
      </div>
    </Container>
  </section>
);
