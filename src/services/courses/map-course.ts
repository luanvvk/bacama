import type { Course as CourseRow, Prisma } from '@/generated/prisma/client';

import { formatDuration } from '@/lib/format-duration';

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

export type DatabaseCourse = CourseRow;
export type DatabaseCourseWithOutline = Prisma.CourseGetPayload<{
  include: typeof COURSE_OUTLINE_INCLUDE;
}>;

// The database spells the enum `in_person`; the UI has always used the hyphen.
const FORMAT: Record<CourseRow['format'], CourseFormat> = {
  online: 'online',
  in_person: 'in-person',
  hybrid: 'hybrid',
};

export const mapCourse = (course: DatabaseCourse): Course => {
  const format = FORMAT[course.format];

  return {
    id: course.id,
    slug: course.slug,
    name: course.titleEn,
    format,
    meta: course.metaEn ?? undefined,
    description: course.descriptionEn,
    imageUrl: course.imageUrl ?? undefined,
    priceVnd: course.priceVnd,
    availability: course.availabilityEn ?? undefined,
    seatLimited: format !== 'online',
    ctaLabel: format === 'in-person' ? 'Book a seat' : 'Enrol',
  };
};

export const mapCourseWithOutline = (course: DatabaseCourseWithOutline): CourseWithOutline => {
  let lessonNumber = 0;

  return {
    ...mapCourse(course),
    modules: course.modules.map((courseModule) => ({
      id: courseModule.id,
      title: courseModule.titleEn,
      lessons: courseModule.lessons.map((lesson) => {
        lessonNumber += 1;

        return {
          id: lesson.id,
          number: String(lessonNumber).padStart(2, '0'),
          title: lesson.titleEn,
          body: lesson.bodyEn ?? undefined,
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
