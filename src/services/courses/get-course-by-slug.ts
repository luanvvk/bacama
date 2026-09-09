import { prisma } from '@/lib/prisma';

import { courseDetailInclude, mapCourseDetail, type CourseDetail } from './map-course';

export const getCourseBySlug = async (
  slug: string,
  now = new Date(),
): Promise<CourseDetail | null> => {
  const course = await prisma.course.findFirst({
    where: { slug, isActive: true },
    include: courseDetailInclude(now),
  });

  return course ? mapCourseDetail(course) : null;
};
