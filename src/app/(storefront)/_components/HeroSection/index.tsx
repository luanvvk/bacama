import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Typography';
import { Container } from '@/components/layout/Container';

export const HeroSection = async () => {
  const t = await getTranslations('Hero');

  return (
    <section className="py-12 sm:py-16">
      <Container className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">{t('eyebrow')}</p>
          <h1 className="font-heading mt-3 text-4xl sm:text-5xl">
            {t('heading')} <em className="italic">{t('headingEmphasis')}</em>
          </h1>
          <Text variant="lead" className="text-muted-foreground mt-4 max-w-prose">
            {t('lead')}
          </Text>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/shop">{t('shopRoast')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/courses">{t('takeWorkshop')}</Link>
            </Button>
          </div>
          <div className="text-muted-foreground mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6 text-sm">
            <span>
              {t.rich('cafesToday', { b: (chunks) => <b className="text-foreground">{chunks}</b> })}
            </span>
            <span>{t('dailyBatch')}</span>
            <span>{t('paymentMethods')}</span>
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
              {t('overlayLabel')}
            </p>
            <p className="font-heading text-sm">{t('overlayValue')}</p>
          </div>
        </div>
      </Container>
    </section>
  );
};
