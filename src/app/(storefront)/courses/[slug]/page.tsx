import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getCourseBySlug } from '@/services/courses/get-course-by-slug';
import { getCourses } from '@/services/courses/get-courses';
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

// Seats-left is a snapshot, same tradeoff the product page already makes for
// stock (task 1.10) — real availability is re-checked when enrolment lands.
export const revalidate = 3600;

export const generateStaticParams = async () => {
  const courses = await getCourses();

  return courses.map((course) => ({ slug: course.slug }));
};

const CourseDetailPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const [t, course] = await Promise.all([getTranslations('CourseDetail'), getCourseBySlug(slug)]);

  if (!course) notFound();

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

          <div className="grid gap-10 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            <CardMedia
              src={course.imageUrl}
              alt={course.name}
              aspect="landscape"
              sizes="(min-width: 1024px) 55vw, 100vw"
              priority
              fallback={<Badge variant="outline">{course.format}</Badge>}
            />
            <EnrolPanel course={course} />
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
