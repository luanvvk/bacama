import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { getFeaturedProducts } from '@/services/catalog/get-featured-products';
import { getProducts } from '@/services/catalog/get-products';
import { getFeaturedCourses } from '@/services/courses/get-featured-courses';
import { Heading } from '@/components/ui/Typography';
import { Container } from '@/components/layout/Container';
import { CourseCard } from '@/components/courses/CourseCard';
import { ProductCard } from '@/components/shop/ProductCard';

export const TodaysStockSection = async () => {
  const t = await getTranslations('TodaysStock');
  const featured = await getFeaturedProducts();
  const products = featured.length >= 2 ? featured : await getProducts();
  const [course] = await getFeaturedCourses(1);

  return (
    <section className="border-t py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-primary font-mono text-xs tracking-widest uppercase">
              {t('eyebrow')}
            </p>
            <Heading as="h2" size="lg" className="mt-2 max-w-lg">
              {t('heading')}
            </Heading>
          </div>
          <Link href="/shop" className="text-primary text-sm font-medium hover:underline">
            {t('browseAll')}
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
