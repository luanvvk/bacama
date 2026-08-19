import { prisma } from '@/lib/prisma';

import { mapCourse, type Course } from './map-course';

/** The workshops teased on the home page — the catalogue is small enough that
 * the oldest few are the established ones. */
export const getFeaturedCourses = async (limit = 3): Promise<Course[]> => {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  return courses.map(mapCourse);
};
