import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { toAppLocale } from '@/lib/localize';

import { getAuthProvider } from '@/lib/providers/auth';
import { getCourseBySlug } from '@/services/courses/get-course-by-slug';
import { getCourses } from '@/services/courses/get-courses';
import { getLearnerEnrollment } from '@/services/enrollments/get-learner-enrollment';
import { getNextLessonId } from '@/services/enrollments/get-next-lesson-id';
import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { CardMedia } from '@/components/ui/CardMedia';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

import { EnrolPanel } from './_components/EnrolPanel';

export const generateStaticParams = async () => {
  const courses = await getCourses('en');

  return courses.map((course) => ({ slug: course.slug }));
};

// Rendered per request: the enrol button becomes "Continue learning" for an
// enrolled viewer, so the page can no longer be a shared static snapshot.
const CourseDetailPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ locked?: string }>;
}) => {
  const [{ slug }, { locked }] = await Promise.all([params, searchParams]);
  const locale = toAppLocale(await getLocale());
  const [t, course, user] = await Promise.all([
    getTranslations('CourseDetail'),
    getCourseBySlug(slug, locale),
    getAuthProvider().getCurrentUser(),
  ]);

  if (!course) notFound();

  const enrollment = user ? await getLearnerEnrollment(user.id, course.id) : null;
  const nextLessonId = getNextLessonId(
    course.modules.flatMap((courseModule) => courseModule.lessons.map((lesson) => lesson.id)),
    enrollment?.completedLessonIds ?? [],
  );
  const continueHref =
    enrollment && nextLessonId ? `/learn/${course.slug}/${nextLessonId}` : undefined;

  return (
    <>
      <main>
        <Container>
          <Breadcrumb className="pt-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t('breadcrumbHome')}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/courses">{t('breadcrumbWorkshops')}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{course.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {locked && !enrollment && (
            <p
              role="status"
              className="border-primary bg-primary/5 mt-6 rounded-lg border p-4 text-sm"
            >
              {t('lessonLocked')}
            </p>
          )}

          <div className="grid gap-10 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            <CardMedia
              src={course.imageUrl}
              alt={course.name}
              aspect="landscape"
              sizes="(min-width: 1024px) 55vw, 100vw"
              priority
              fallback={
                <div className="flex flex-col items-center gap-3">
                  <span aria-hidden className="font-heading text-primary text-7xl">
                    {course.name.charAt(0)}
                  </span>
                  <Badge variant="outline">{course.format}</Badge>
                </div>
              }
            />
            <EnrolPanel course={course} continueHref={continueHref} />
          </div>

          <Tabs defaultValue="outline" className="mt-4 border-t pt-8">
            <TabsList variant="line">
              <TabsTrigger value="outline">{t('outlineTab')}</TabsTrigger>
              {course.seatLimited && <TabsTrigger value="sessions">{t('sessionsTab')}</TabsTrigger>}
            </TabsList>

            <TabsContent value="outline">
              <div className="flex flex-col gap-6 py-6">
                {course.modules.map((courseModule) => (
                  <div key={courseModule.id}>
                    <h2 className="font-heading text-lg">{courseModule.title}</h2>
                    <ul className="mt-2 flex flex-col divide-y rounded-lg border">
                      {courseModule.lessons.map((lesson) => (
                        <li
                          key={lesson.id}
                          className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-muted-foreground font-mono text-xs">
                              {lesson.number}
                            </span>
                            <span>{lesson.title}</span>
                            {lesson.isFreePreview && (
                              <Badge variant="success">{t('freePreview')}</Badge>
                            )}
                          </span>
                          {lesson.duration && (
                            <span className="text-muted-foreground font-mono text-xs">
                              {lesson.duration}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </TabsContent>

            {course.seatLimited && (
              <TabsContent value="sessions">
                {course.sessions.length === 0 ? (
                  <p className="text-muted-foreground py-6 text-sm">{t('noSessions')}</p>
                ) : (
                  <ul className="flex flex-col gap-3 py-6">
                    {course.sessions.map((session) => (
                      <li
                        key={session.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">{session.startsAt}</p>
                          <p className="text-muted-foreground text-sm">{session.siteName}</p>
                        </div>
                        <Badge variant={session.seatsLeft > 0 ? 'warning' : 'destructive'}>
                          {session.seatsLeft > 0
                            ? t('seatsLeft', { count: session.seatsLeft })
                            : t('soldOut')}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            )}
          </Tabs>
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default CourseDetailPage;
