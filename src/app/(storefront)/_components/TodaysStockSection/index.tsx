import Image from 'next/image';
import Link from 'next/link';

import { getProductBySlug } from '@/constants/products';
import { Heading, Text } from '@/components/ui/Typography';
import { Container } from '@/components/layout/Container';
import { ProductCard } from '@/components/shop/ProductCard';

const dalatWashed = getProductBySlug('dalat-washed')!;
const croissant = getProductBySlug('croissant-aux-amandes')!;

export const TodaysStockSection = () => (
  <section className="border-t py-16">
    <Container>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            01 · Today&apos;s stock
          </p>
          <Heading as="h2" size="lg" className="mt-2 max-w-lg">
            Three things, picked before the shop opened.
          </Heading>
        </div>
        <Link href="/shop" className="text-primary text-sm font-medium hover:underline">
          Browse all →
        </Link>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard product={dalatWashed} featured />
        <ProductCard product={croissant} />
        <article className="flex flex-col">
          <Link
            href="/courses"
            className="bg-muted relative block aspect-4/5 overflow-hidden rounded-lg"
          >
            <Image
              src="https://images.unsplash.com/photo-1445116572660-236099ec47a3?auto=format&fit=crop&w=620&q=72"
              alt="Barista pulling an espresso shot"
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover"
            />
          </Link>
          <div className="mt-3 flex flex-1 flex-col">
            <p className="text-primary font-mono text-xs tracking-widest uppercase">Workshop</p>
            <h3 className="font-heading mt-1 text-lg">
              <Link href="/courses">Barista Foundations</Link>
            </h3>
            <Text variant="muted" className="mt-1">
              Six weeks online, final exam on-site in Hội An.
            </Text>
            <div className="mt-auto flex items-center justify-between gap-3 pt-3">
              <span className="font-mono font-bold tabular-nums">1.890.000 ₫</span>
              <Link href="/courses" className="text-primary text-sm font-medium hover:underline">
                Enroll →
              </Link>
            </div>
          </div>
        </article>
      </div>
    </Container>
  </section>
);
