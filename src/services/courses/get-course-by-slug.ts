import type { AppLocale } from '@/lib/localize';
import { prisma } from '@/lib/prisma';

import { courseDetailInclude, mapCourseDetail, type CourseDetail } from './map-course';

export const getCourseBySlug = async (
  slug: string,
  locale: AppLocale,
  now = new Date(),
): Promise<CourseDetail | null> => {
  const course = await prisma.course.findFirst({
    where: { slug, isActive: true },
    include: courseDetailInclude(now),
  });

  return course ? mapCourseDetail(course, locale) : null;
};
