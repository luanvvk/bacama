import type { Course as CourseRow, Prisma } from '@/generated/prisma/client';

import { formatDuration } from '@/lib/format-duration';
import { pickLocalized, type AppLocale } from '@/lib/localize';

export type CourseFormat = 'online' | 'in-person' | 'hybrid';

export interface CourseDocument {
  id: string;
  name: string;
  size: string;
}

export interface CourseLesson {
  id: string;
  /** Position across the whole course, zero-padded for the outline. */
  number: string;
  title: string;
  body?: string;
  duration?: string;
  isFreePreview: boolean;
  documents: CourseDocument[];
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  slug: string;
  name: string;
  format: CourseFormat;
  meta?: string;
  description: string;
  imageUrl?: string;
  priceVnd: number;
  availability?: string;
  /** In-person and hybrid courses run on seats, so their availability can run out. */
  seatLimited: boolean;
  ctaLabel: string;
}

export interface CourseWithOutline extends Course {
  modules: CourseModule[];
}

export interface CourseSession {
  id: string;
  /** Pre-formatted for display, e.g. "Sat, 14 Sep · 09:00". */
  startsAt: string;
  siteName: string;
  siteSlug: string;
  capacity: number;
  seatsLeft: number;
}

export interface CourseDetail extends CourseWithOutline {
  sessions: CourseSession[];
}

export const COURSE_OUTLINE_INCLUDE = {
  modules: {
    orderBy: { order: 'asc' },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: { attachments: { orderBy: { createdAt: 'asc' } } },
      },
    },
  },
} satisfies Prisma.CourseInclude;

// Sessions filter on `now`, so this has to be a factory rather than a static
// `satisfies`-typed constant like COURSE_OUTLINE_INCLUDE above.
export const courseDetailInclude = (now: Date) =>
  ({
    ...COURSE_OUTLINE_INCLUDE,
    sessions: {
      where: { startsAt: { gte: now } },
      orderBy: { startsAt: 'asc' as const },
      include: {
        site: true,
        // Lapsed holds still count in `seatsBooked` until the daily sweep frees them.
        _count: {
          select: {
            enrollments: { where: { status: 'pending' as const, holdExpiresAt: { lt: now } } },
          },
        },
      },
    },
  }) satisfies Prisma.CourseInclude;

export type DatabaseCourse = CourseRow;
export type DatabaseCourseWithOutline = Prisma.CourseGetPayload<{
  include: typeof COURSE_OUTLINE_INCLUDE;
}>;
export type DatabaseCourseDetail = Prisma.CourseGetPayload<{
  include: ReturnType<typeof courseDetailInclude>;
}>;

// Every session is in Vietnam (Site.timezone defaults to it) — pinned so a
// UTC-stored startsAt never renders as the previous day for a reader west
// of UTC.
const SESSION_DAY = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'Asia/Ho_Chi_Minh',
});
const SESSION_TIME = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Ho_Chi_Minh',
});

export const formatSessionDate = (startsAt: Date) =>
  `${SESSION_DAY.format(startsAt)} · ${SESSION_TIME.format(startsAt)}`;

// The database spells the enum `in_person`; the UI has always used the hyphen.
const FORMAT: Record<CourseRow['format'], CourseFormat> = {
  online: 'online',
  in_person: 'in-person',
  hybrid: 'hybrid',
};

export const mapCourse = (course: DatabaseCourse, locale: AppLocale): Course => {
  const format = FORMAT[course.format];

  return {
    id: course.id,
    slug: course.slug,
    name: pickLocalized(locale, course.titleVi, course.titleEn),
    format,
    meta: pickLocalized(locale, course.metaVi, course.metaEn) ?? undefined,
    description: pickLocalized(locale, course.descriptionVi, course.descriptionEn),
    imageUrl: course.imageUrl ?? undefined,
    priceVnd: course.priceVnd,
    availability: pickLocalized(locale, course.availabilityVi, course.availabilityEn) ?? undefined,
    seatLimited: format !== 'online',
    ctaLabel: format === 'in-person' ? 'Book a seat' : 'Enrol',
  };
};

export const mapCourseWithOutline = (
  course: DatabaseCourseWithOutline,
  locale: AppLocale,
): CourseWithOutline => {
  let lessonNumber = 0;

  return {
    ...mapCourse(course, locale),
    modules: course.modules.map((courseModule) => ({
      id: courseModule.id,
      title: pickLocalized(locale, courseModule.titleVi, courseModule.titleEn),
      lessons: courseModule.lessons.map((lesson) => {
        lessonNumber += 1;

        return {
          id: lesson.id,
          number: String(lessonNumber).padStart(2, '0'),
          title: pickLocalized(locale, lesson.titleVi, lesson.titleEn),
          body: pickLocalized(locale, lesson.bodyVi, lesson.bodyEn) ?? undefined,
          duration: formatDuration(lesson.durationSec) ?? undefined,
          isFreePreview: lesson.isFreePreview,
          documents: lesson.attachments.map((attachment) => ({
            id: attachment.id,
            name: attachment.name,
            size: attachment.size,
          })),
        };
      }),
    })),
  };
};

export const mapCourseDetail = (course: DatabaseCourseDetail, locale: AppLocale): CourseDetail => ({
  ...mapCourseWithOutline(course, locale),
  sessions: course.sessions.map((session) => ({
    id: session.id,
    startsAt: formatSessionDate(session.startsAt),
    siteName: pickLocalized(locale, session.site.nameVi, session.site.nameEn),
    siteSlug: session.site.slug,
    capacity: session.capacity,
    seatsLeft: Math.max(session.capacity - (session.seatsBooked - session._count.enrollments), 0),
  })),
});
