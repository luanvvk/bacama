import Link from 'next/link';

import { getFeaturedProducts } from '@/services/catalog/get-featured-products';
import { getProducts } from '@/services/catalog/get-products';
import { getFeaturedCourses } from '@/services/courses/get-featured-courses';
import { Heading } from '@/components/ui/Typography';
import { Container } from '@/components/layout/Container';
import { CourseCard } from '@/components/courses/CourseCard';
import { ProductCard } from '@/components/shop/ProductCard';

export const TodaysStockSection = async () => {
  const featured = await getFeaturedProducts();
  const products = featured.length >= 2 ? featured : await getProducts();
  const [course] = await getFeaturedCourses(1);

  return (
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
          {products[0] && <ProductCard product={products[0]} featured />}
          {products[1] && <ProductCard product={products[1]} />}
          {course && <CourseCard course={course} />}
        </div>
      </Container>
    </section>
  );
};
