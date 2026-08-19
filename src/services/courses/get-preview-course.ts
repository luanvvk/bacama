import { prisma } from '@/lib/prisma';

import {
  COURSE_OUTLINE_INCLUDE,
  mapCourseWithOutline,
  type CourseLesson,
  type CourseWithOutline,
} from './map-course';

export interface CoursePreview {
  course: CourseWithOutline;
  lesson: CourseLesson;
  moduleLabel: string;
}

/** The one lesson anyone can watch without an account, with the outline around
 * it. `/learn` has no course of its own until real enrolment exists. */
export const getPreviewCourse = async (): Promise<CoursePreview | null> => {
  const course = await prisma.course.findFirst({
    where: { isActive: true, modules: { some: { lessons: { some: { isFreePreview: true } } } } },
    include: COURSE_OUTLINE_INCLUDE,
    orderBy: { createdAt: 'asc' },
  });

  if (!course) return null;

  const mapped = mapCourseWithOutline(course);
  const owningModule = mapped.modules.find((courseModule) =>
    courseModule.lessons.some((lesson) => lesson.isFreePreview),
  );
  const lesson = owningModule?.lessons.find((item) => item.isFreePreview);

  if (!owningModule || !lesson) return null;

  return { course: mapped, lesson, moduleLabel: `${owningModule.title} · Lesson ${lesson.number}` };
};
