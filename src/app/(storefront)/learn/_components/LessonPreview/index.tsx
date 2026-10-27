'use client';

import Link from 'next/link';
import { Check, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import type { CoursePreview } from '@/services/courses/get-preview-course';
import { Button } from '@/components/ui/Button';
import { CardMedia } from '@/components/ui/CardMedia';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Heading, Text } from '@/components/ui/Typography';

export interface LessonPreviewProps {
  preview: CoursePreview;
  /** Null when the lesson has no video yet. */
  embedUrl: string | null;
  isGuest: boolean;
  /** Lessons the viewer may not open: paid lessons without an active enrolment. */
  lockedLessonIds: string[];
  completedLessonIds: string[];
  previousHref?: string;
  nextHref?: string;
}

export const LessonPreview = ({
  preview,
  embedUrl,
  isGuest,
  lockedLessonIds,
  completedLessonIds,
  previousHref,
  nextHref,
}: LessonPreviewProps) => {
  const t = useTranslations('Learn');
  const { course, lesson, moduleLabel } = preview;
  const totalLessons = course.modules.reduce(
    (sum, courseModule) => sum + courseModule.lessons.length,
    0,
  );

  return (
    <div className="grid gap-10 py-8 lg:grid-cols-[1fr_320px]">
      <div>
        {isGuest && (
          <div className="border-primary bg-primary/5 flex flex-wrap items-center gap-3 rounded-lg border p-4 text-sm">
            <Lock className="text-primary size-4 shrink-0" aria-hidden="true" />
            <p className="min-w-52 flex-1">
              <b>{t('freePreviewBold')}</b>{' '}
              <span className="text-muted-foreground">{t('signInHint')}</span>
            </p>
            <Button asChild size="sm">
              <Link href="/login">{t('logIn')}</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/courses">{t('allCourses')}</Link>
            </Button>
          </div>
        )}

        {embedUrl ? (
          <div className="mt-6 aspect-video overflow-hidden rounded-lg bg-black">
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="size-full"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : (
          <CardMedia src={course.imageUrl} alt="" aspect="video" zoom={false} className="mt-6">
            <p className="bg-background/90 absolute inset-x-0 bottom-0 p-3 text-center text-sm">
              {t('videoComingSoon')}
            </p>
          </CardMedia>
        )}

        {(previousHref || nextHref) && (
          <nav aria-label={t('lessonNavLabel')} className="mt-4 flex justify-between gap-3">
            {previousHref ? (
              <Button asChild variant="outline" size="touch-sm">
                <Link href={previousHref}>
                  <ChevronLeft aria-hidden="true" />
                  {t('previousLesson')}
                </Link>
              </Button>
            ) : (
              <span />
            )}
            {nextHref && (
              <Button asChild variant="outline" size="touch-sm">
                <Link href={nextHref}>
                  {t('nextLesson')}
                  <ChevronRight aria-hidden="true" />
                </Link>
              </Button>
            )}
          </nav>
        )}

        <p className="text-primary mt-6 font-mono text-xs tracking-widest uppercase">
          {moduleLabel}
        </p>
        <Heading as="h1" size="md" className="mt-2">
          {lesson.title}
        </Heading>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList variant="line">
            <TabsTrigger value="overview">{t('tabOverview')}</TabsTrigger>
            <TabsTrigger value="documents">{t('tabDocuments')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="flex flex-col gap-4 py-6">
              <Text variant="muted">{lesson.body ?? t('noOverview')}</Text>
              {isGuest && (
                <Button asChild className="w-fit">
                  <Link href="/login">{t('signInTrackProgress')}</Link>
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="documents">
            {lesson.documents.length === 0 ? (
              <p className="text-muted-foreground py-6 text-sm">{t('noDocuments')}</p>
            ) : (
              <ul className="flex flex-col gap-2 py-6">
                {lesson.documents.map((document) => (
                  <li key={document.id} className="flex items-center gap-3 rounded-lg border p-3">
                    {isGuest && (
                      <Lock className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
                    )}
                    <div className="flex-1">
                      {isGuest ? (
                        <p className="text-sm font-medium">{document.name}</p>
                      ) : (
                        <a
                          href={`/api/attachments/${document.id}`}
                          className="text-sm font-medium underline-offset-4 hover:underline"
                        >
                          {document.name}
                        </a>
                      )}
                      <p className="text-muted-foreground text-xs">{document.size}</p>
                    </div>
                    {isGuest && (
                      <span className="text-muted-foreground font-mono text-xs uppercase">
                        {t('signInToDownload')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <aside className="flex flex-col gap-8">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            {t('courseLabel')}
          </p>
          <Heading as="h2" size="xs" className="mt-1">
            {course.name}
          </Heading>
          <p className="text-muted-foreground mt-1 font-mono text-xs">
            {t('lessonCount', { count: totalLessons })}
          </p>

          <div className="mt-4 flex flex-col gap-4">
            {course.modules.map((courseModule) => (
              <div key={courseModule.id}>
                <p className="text-muted-foreground mb-2 font-mono text-xs tracking-widest uppercase">
                  {courseModule.title}
                </p>
                <ul className="flex flex-col gap-1">
                  {courseModule.lessons.map((moduleLesson) => {
                    const isCurrent = moduleLesson.id === lesson.id;
                    const isLocked = lockedLessonIds.includes(moduleLesson.id);
                    const isCompleted = completedLessonIds.includes(moduleLesson.id);
                    const rowClass = cn(
                      'flex items-center gap-2 rounded-md border px-2.5 py-2 text-sm',
                      isCurrent ? 'border-primary bg-primary/5' : 'border-transparent',
                    );
                    const rowContent = (
                      <>
                        <span className="text-muted-foreground font-mono text-xs">
                          {moduleLesson.number}
                        </span>
                        <span className="flex-1">{moduleLesson.title}</span>
                        {isLocked && (
                          <>
                            <Lock className="text-muted-foreground size-3.5" aria-hidden="true" />
                            <span className="sr-only">{t('lessonLocked')}</span>
                          </>
                        )}
                        {isCompleted && (
                          <>
                            <Check className="text-success size-3.5" aria-hidden="true" />
                            <span className="sr-only">{t('lessonCompleted')}</span>
                          </>
                        )}
                        <span className="text-muted-foreground text-xs">
                          {moduleLesson.duration}
                        </span>
                      </>
                    );

                    return (
                      <li key={moduleLesson.id}>
                        {isLocked ? (
                          <div aria-disabled="true" className={cn(rowClass, 'opacity-60')}>
                            {rowContent}
                          </div>
                        ) : (
                          <Link
                            href={`/learn/${course.slug}/${moduleLesson.id}`}
                            aria-current={isCurrent ? 'page' : undefined}
                            className={cn(rowClass, 'hover:bg-muted/50')}
                          >
                            {rowContent}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};
