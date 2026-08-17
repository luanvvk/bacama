import Link from 'next/link';

import { getCourseBySlug } from '@/constants/courses';
import { Heading } from '@/components/ui/Typography';
import { Container } from '@/components/layout/Container';
import { CourseCard } from '@/components/courses/CourseCard';

const FEATURED_WORKSHOP_SLUGS = ['latte-art', 'viennoiserie', 'cupping-origin'] as const;
const featuredWorkshops = FEATURED_WORKSHOP_SLUGS.map((slug) => getCourseBySlug(slug)!);

export const WorkshopsSection = () => (
  <section className="border-t py-16">
    <Container>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">03 · Workshops</p>
          <Heading as="h2" size="lg" className="mt-2 max-w-lg">
            Taught by the people who bake at five.
          </Heading>
        </div>
        <Link href="/courses" className="text-primary text-sm font-medium hover:underline">
          All courses →
        </Link>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuredWorkshops.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </Container>
  </section>
);
