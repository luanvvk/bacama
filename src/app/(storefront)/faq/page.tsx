'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Coffee, Croissant, GraduationCap, Package, Search } from 'lucide-react';

import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

const GROUP_ICONS: Record<string, typeof Coffee> = {
  orders: Coffee,
  bakery: Croissant,
  courses: GraduationCap,
  shipping: Package,
};

const FaqPage = () => {
  const t = useTranslations('FaqPage');
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<string>('all');

  const faqGroups = t.raw('groups') as FaqGroup[];

  const filteredGroups = faqGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.q.toLowerCase().includes(query.toLowerCase()) ||
          item.a.toLowerCase().includes(query.toLowerCase()),
      ),
    }))
    .filter((group) => activeGroup === 'all' || group.id === activeGroup);

  const hasResults = filteredGroups.some((group) => group.items.length > 0);

  return (
    <>
      <main>
        <section className="border-b py-12 sm:py-16">
          <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16">
            <div>
              <p className="text-primary font-mono text-xs tracking-widest uppercase">
                {t('eyebrow')}
              </p>
              <Heading as="h1" size="xl" className="mt-3 text-4xl sm:text-5xl">
                {t('heading')}
              </Heading>
              <Text variant="lead" className="text-muted-foreground mt-5 max-w-2xl">
                {t('intro')}
              </Text>
            </div>
            <aside className="border-primary/40 border-t pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
              <p className="text-primary font-mono text-xs tracking-widest uppercase">
                {t('sidebarEyebrow')}
              </p>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {t('sidebarText')}
              </p>
            </aside>
          </Container>
        </section>

        <Container className="py-12 sm:py-16">
          <div className="relative mb-8 max-w-2xl">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchAriaLabel')}
              className="border-input bg-background focus-visible:border-ring h-11 w-full rounded-lg border px-10 text-base transition-colors outline-none focus-visible:ring-0"
            />
          </div>

          <div className="mb-10 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveGroup('all')}
              className={cn(
                'rounded-full border px-4 py-1.5 font-mono text-xs tracking-wide transition-colors',
                activeGroup === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:border-primary hover:text-primary',
              )}
            >
              {t('allTopics')}
            </button>
            {faqGroups.map((group) => {
              const Icon = GROUP_ICONS[group.id] ?? Coffee;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveGroup(group.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-4 py-1.5 font-mono text-xs tracking-wide transition-colors',
                    activeGroup === group.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:border-primary hover:text-primary',
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {group.title}
                </button>
              );
            })}
          </div>

          {hasResults ? (
            <div className="space-y-12">
              {filteredGroups.map((group) => {
                const Icon = GROUP_ICONS[group.id] ?? Coffee;
                return (
                  group.items.length > 0 && (
                    <section key={group.id} id={group.id}>
                      <div className="mb-4 flex items-center gap-3 border-b pb-3">
                        <Icon className="text-primary size-5 shrink-0" aria-hidden="true" />
                        <Heading as="h2" size="sm">
                          {group.title}
                        </Heading>
                        <span className="text-muted-foreground font-mono text-xs">
                          {group.items.length}
                        </span>
                      </div>
                      <Accordion type="multiple">
                        {group.items.map((item) => (
                          <AccordionItem key={item.q} value={item.q}>
                            <AccordionTrigger className="text-base">{item.q}</AccordionTrigger>
                            <AccordionContent>
                              <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
                                {item.a}
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </section>
                  )
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Text variant="muted" className="text-base">
                {t('noResults', { query })}{' '}
                <Link href="/contact" className="text-primary underline">
                  {t('noResultsContactLink')}
                </Link>
                .
              </Text>
            </div>
          )}

          <aside className="mt-16 rounded-lg border border-dashed p-8 text-center sm:p-12">
            <p className="text-primary font-mono text-xs tracking-widest uppercase">
              {t('ctaEyebrow')}
            </p>
            <Heading as="h2" size="sm" className="mt-3">
              {t('ctaHeading')}
            </Heading>
            <Text variant="muted" className="mt-3 max-w-md">
              {t('ctaText')}
            </Text>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/contact">{t('ctaButton')}</Link>
            </Button>
          </aside>
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default FaqPage;
