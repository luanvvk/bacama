import Link from 'next/link';

import { getCourseBySlug } from '@/constants/courses';
import { getProductBySlug } from '@/constants/products';
import { Heading } from '@/components/ui/Typography';
import { Container } from '@/components/layout/Container';
import { CourseCard } from '@/components/courses/CourseCard';
import { ProductCard } from '@/components/shop/ProductCard';

const dalatWashed = getProductBySlug('dalat-washed')!;
const houseBlend = getProductBySlug('house-blend')!;
const baristaFoundations = getCourseBySlug('barista-foundations')!;

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
        <ProductCard product={houseBlend} />
        <CourseCard course={baristaFoundations} />
      </div>
    </Container>
  </section>
);
