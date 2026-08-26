import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { getFeaturedCourses } from '@/services/courses/get-featured-courses';
import { Heading } from '@/components/ui/Typography';
import { Container } from '@/components/layout/Container';
import { CourseCard } from '@/components/courses/CourseCard';

export const WorkshopsSection = async () => {
  const t = await getTranslations('Workshops');
  const courses = await getFeaturedCourses();

  if (courses.length === 0) return null;

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
          <Link href="/courses" className="text-primary text-sm font-medium hover:underline">
            {t('allCourses')}
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </Container>
    </section>
  );
};
