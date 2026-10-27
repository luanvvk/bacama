import { prisma } from '@/lib/prisma';

export class LessonAccessError extends Error {
  constructor() {
    super('No access to this lesson');
  }
}

interface SaveLessonProgressInput {
  userId: string;
  lessonId: string;
  secondsWatched: number;
  completed: boolean;
}

/** Records how far the user got in a lesson. The enrolment is looked up from
 * the signed-in user and the lesson's course, never taken from the client, and
 * only a paid (`active`/`completed`) enrolment may write. Completion is
 * sticky: a later save never clears `completedAt`. */
export const saveLessonProgress = async ({
  userId,
  lessonId,
  secondsWatched,
  completed,
}: SaveLessonProgressInput) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { courseId: true } } },
  });
  if (!lesson) throw new LessonAccessError();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.module.courseId } },
    select: { id: true, status: true },
  });
  if (!enrollment || (enrollment.status !== 'active' && enrollment.status !== 'completed')) {
    throw new LessonAccessError();
  }

  const key = { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } };
  const existing = await prisma.progress.findUnique({ where: key, select: { completedAt: true } });
  const completedAt = existing?.completedAt ?? (completed ? new Date() : null);

  await prisma.progress.upsert({
    where: key,
    create: { enrollmentId: enrollment.id, lessonId, secondsWatched, completedAt },
    update: { secondsWatched, completedAt },
  });
};
