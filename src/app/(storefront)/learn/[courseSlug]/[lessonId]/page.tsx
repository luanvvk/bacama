import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { toAppLocale } from '@/lib/localize';

import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { getAuthProvider } from '@/lib/providers/auth';
import { getVideoProvider } from '@/lib/providers/video';
import { getCourseBySlug } from '@/services/courses/get-course-by-slug';
import { getLessonVideoId } from '@/services/courses/get-lesson-video-id';
import { getLearnerEnrollment } from '@/services/enrollments/get-learner-enrollment';

import { LessonPreview } from '../../_components/LessonPreview';

const LessonPage = async ({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}) => {
  const { courseSlug, lessonId } = await params;
  const locale = toAppLocale(await getLocale());
  const [t, course, user] = await Promise.all([
    getTranslations('Learn'),
    getCourseBySlug(courseSlug, locale),
    getAuthProvider().getCurrentUser(),
  ]);

  if (!course) notFound();

  const lessons = course.modules.flatMap((courseModule) =>
    courseModule.lessons.map((item) => ({ item, moduleTitle: courseModule.title })),
  );
  const index = lessons.findIndex(({ item }) => item.id === lessonId);

  if (index === -1) notFound();

  const { item: lesson, moduleTitle } = lessons[index];
  const enrollment = user ? await getLearnerEnrollment(user.id, course.id) : null;
  const video = getVideoProvider();

  if (!enrollment && !video.isPreview(lesson)) redirect(`/courses/${courseSlug}?locked=1`);

  const videoId = await getLessonVideoId(lesson.id);
  const playback = videoId ? await video.getSignedPlayback(videoId, user?.id ?? null) : null;
  const lessonHref = (target?: { item: { id: string } }) =>
    target ? `/learn/${courseSlug}/${target.item.id}` : undefined;

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

          <LessonPreview
            preview={{
              course,
              lesson,
              moduleLabel: `${moduleTitle} · ${t('lessonNumber', { number: lesson.number })}`,
            }}
            embedUrl={playback?.embedUrl ?? null}
            isGuest={!user}
            lockedLessonIds={
              enrollment
                ? []
                : lessons.filter(({ item }) => !video.isPreview(item)).map(({ item }) => item.id)
            }
            completedLessonIds={enrollment?.completedLessonIds ?? []}
            previousHref={lessonHref(lessons[index - 1])}
            nextHref={lessonHref(lessons[index + 1])}
          />
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default LessonPage;
