'use client';

import Link from 'next/link';
import { useState } from 'react';
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
  icon: typeof Coffee;
  items: FaqItem[];
}

const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'orders',
    title: 'Coffee & orders',
    icon: Coffee,
    items: [
      {
        q: 'When do you roast?',
        a: 'We roast in small batches through the week. The roast date is printed on every bag and shown on each product page, so you always know how fresh it is.',
      },
      {
        q: 'How quickly do you ship?',
        a: 'Orders leave within 24 hours of roasting. Nationwide delivery usually takes 2–3 days through GHN. Same-day delivery is available in Đà Nẵng through Ahamove and GrabExpress.',
      },
      {
        q: 'Can I order wholesale bags?',
        a: 'Yes. Choose the 1 kg option in the shop or visit our wholesale page to start a conversation about a regular café order.',
      },
      {
        q: 'Do you sell whole bean or pre-ground?',
        a: 'Both. Each product page lets you select a grind option — whole bean, phin, espresso, pour-over — so you get coffee ready for how you brew.',
      },
      {
        q: 'How should I store the coffee?',
        a: 'Keep the bag sealed and away from direct sunlight, heat, and moisture. Once opened, try to finish it within 2–3 weeks. Coffee does not need to go in the fridge.',
      },
    ],
  },
  {
    id: 'bakery',
    title: 'Bakery & pastries',
    icon: Croissant,
    items: [
      {
        q: 'What time do you bake?',
        a: 'Pastries come out of the oven from 05:00 every morning. If you want a croissant, come early — they go fast and we do not hold them overnight.',
      },
      {
        q: 'Can I order a whole cake?',
        a: 'Yes, with 48 hours’ notice. Contact us with what you need and for when, and we will confirm what we can make.',
      },
      {
        q: 'Are pastries available for delivery?',
        a: 'Pastries are available for local collection or same-day delivery only, because they are best eaten the day they are made.',
      },
    ],
  },
  {
    id: 'courses',
    title: 'Courses & learning',
    icon: GraduationCap,
    items: [
      {
        q: 'Do I need an account to browse courses?',
        a: 'No. You can browse every course and watch the public preview lesson without signing in. An account is only needed to save progress, take assessments, and receive a certificate.',
      },
      {
        q: 'Are in-person classes held in English?',
        a: 'Classes are supported in English and Vietnamese. Contact us before booking if you have accessibility or language questions.',
      },
      {
        q: 'Do I get a certificate?',
        a: 'Yes. Completing the required lessons and assessment for a course earns a Bacama certificate, visible from your learning page once auth is connected.',
      },
      {
        q: 'Can I get a refund on a course?',
        a: 'Online course enrolments can be cancelled before the first lesson is watched for a full refund. After that, contact us and we will see what we can do.',
      },
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping & returns',
    icon: Package,
    items: [
      {
        q: 'What if my parcel arrives damaged?',
        a: 'Take a photo before opening the parcel and contact us within 48 hours. We will replace or refund — no room for argument on that one.',
      },
      {
        q: 'Can I change my order?',
        a: 'Contact us as soon as possible. Once a parcel has been collected by the courier, changes may not be possible.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Not yet. We currently deliver within Vietnam. If you are outside the country, contact us and we can explore options for a large order.',
      },
    ],
  },
];

const FaqPage = () => {
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<string>('all');

  const filteredGroups = FAQ_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        item.q.toLowerCase().includes(query.toLowerCase()) ||
        item.a.toLowerCase().includes(query.toLowerCase()),
    ),
  })).filter((group) => activeGroup === 'all' || group.id === activeGroup);

  const hasResults = filteredGroups.some((group) => group.items.length > 0);

  return (
    <>
      <main>
        <section className="border-b py-12 sm:py-16">
          <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16">
            <div>
              <p className="text-primary font-mono text-xs tracking-widest uppercase">
                Help · answers in plain language
              </p>
              <Heading as="h1" size="xl" className="mt-3 text-4xl sm:text-5xl">
                Frequently asked questions.
              </Heading>
              <Text variant="lead" className="text-muted-foreground mt-5 max-w-2xl">
                A few useful things before you order, book a class, or come by the café. Search or
                browse by topic.
              </Text>
            </div>
            <aside className="border-primary/40 border-t pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
              <p className="text-primary font-mono text-xs tracking-widest uppercase">
                Bacama · Đà Nẵng
              </p>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                Small batches, an early bake, and a real person behind the answer.
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
              placeholder="Search questions…"
              aria-label="Search FAQ"
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
              All topics
            </button>
            {FAQ_GROUPS.map((group) => {
              const Icon = group.icon;
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
              {filteredGroups.map(
                (group) =>
                  group.items.length > 0 && (
                    <section key={group.id} id={group.id}>
                      <div className="mb-4 flex items-center gap-3 border-b pb-3">
                        <group.icon className="text-primary size-5 shrink-0" aria-hidden="true" />
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
                  ),
              )}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Text variant="muted" className="text-base">
                No questions match &ldquo;{query}&rdquo;. Try a different word or{' '}
                <Link href="/contact" className="text-primary underline">
                  contact us
                </Link>
                .
              </Text>
            </div>
          )}

          <aside className="mt-16 rounded-lg border border-dashed p-8 text-center sm:p-12">
            <p className="text-primary font-mono text-xs tracking-widest uppercase">
              Still unsure?
            </p>
            <Heading as="h2" size="sm" className="mt-3">
              Talk to the people behind the counter.
            </Heading>
            <Text variant="muted" className="mt-3 max-w-md">
              We answer messages during opening hours, every day. There is no chatbot — just us.
            </Text>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/contact">Contact us</Link>
            </Button>
          </aside>
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default FaqPage;
