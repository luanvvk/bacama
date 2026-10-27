import type { AppLocale } from '@/lib/localize';
import { prisma } from '@/lib/prisma';

import { mapCourse, type Course } from './map-course';

export { mapCourse, type Course, type CourseFormat } from './map-course';

// Course has no explicit ordering column; seed order is insertion order, which
// is the order the catalogue has always been presented in.
export const getCourses = async (locale: AppLocale): Promise<Course[]> => {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  return courses.map((course) => mapCourse(course, locale));
};
