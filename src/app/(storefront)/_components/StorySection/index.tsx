import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';
import { Container } from '@/components/layout/Container';

export const StorySection = async () => {
  const t = await getTranslations('Story');

  return (
    <section className="dark bg-background border-t">
      <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="relative aspect-4/5 overflow-hidden rounded-lg">
          <Image
            src="https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=900&q=72"
            alt="The roastery in early morning light"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">{t('eyebrow')}</p>
          <Heading as="h2" size="lg" className="mt-3 max-w-md">
            {t('heading')}
          </Heading>
          <Text variant="lead" className="text-muted-foreground mt-5 max-w-prose">
            {t('lead')}
          </Text>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/story">{t('readStory')}</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
};
