import { prisma } from '@/lib/prisma';

export interface LearnerEnrollment {
  id: string;
  completedLessonIds: string[];
}

/** The user's enrolment in a course if it grants access to paid lessons, else
 * null. Only `active` and `completed` count: a pending enrolment or a seat
 * hold has not been paid for, and a cancelled one has been given up. */
export const getLearnerEnrollment = async (
  userId: string,
  courseId: string,
): Promise<LearnerEnrollment | null> => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: {
      id: true,
      status: true,
      progress: { where: { completedAt: { not: null } }, select: { lessonId: true } },
    },
  });

  if (!enrollment || (enrollment.status !== 'active' && enrollment.status !== 'completed')) {
    return null;
  }

  return {
    id: enrollment.id,
    completedLessonIds: enrollment.progress.map((progress) => progress.lessonId),
  };
};
