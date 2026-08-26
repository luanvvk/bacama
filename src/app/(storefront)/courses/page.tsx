import Link from 'next/link';
import { Lock } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getCourses } from '@/services/courses/get-courses';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { Heading, Text } from '@/components/ui/Typography';

import { CoursesBrowser } from './_components/CoursesBrowser';

export const revalidate = 3600;

const CoursesPage = async () => {
  const [t, courses] = await Promise.all([getTranslations('Courses'), getCourses()]);

  const announcements = [
    t('allCoursesCount', { count: courses.length }),
    t('firstLessonFree'),
    t('certificateOnCompletion'),
  ];

  return (
    <>
      <AnnouncementBar items={announcements} />
      <main>
        <Container>
          <Breadcrumb className="pt-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t('breadcrumbHome')}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('breadcrumbCurrent')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-6">
            <p className="text-primary font-mono text-xs tracking-widest uppercase">
              {t('eyebrow')}
            </p>
            <Heading as="h1" size="lg" className="mt-2 max-w-lg">
              {t('heading')}
            </Heading>
            <Text variant="muted" className="mt-3 max-w-prose">
              {t('subtext')}
            </Text>

            <div className="border-primary bg-primary/5 mt-6 flex flex-wrap items-center gap-4 rounded-lg border p-4">
              <Lock className="text-primary size-5 shrink-0" aria-hidden="true" />
              <div className="min-w-52 flex-1">
                <p className="text-sm font-semibold">{t('publicNoticeTitle')}</p>
                <p className="text-muted-foreground text-sm">{t('publicNoticeBody')}</p>
              </div>
              <Button asChild size="sm">
                <Link href="/login">{t('logIn')}</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/me">{t('toStudentPage')}</Link>
              </Button>
            </div>
          </div>

          <CoursesBrowser courses={courses} />
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default CoursesPage;
