import { prisma } from '@/lib/prisma';

/** Seconds into the lesson where the learner stopped; 0 when never watched or
 * once the lesson is completed, so a finished lesson replays from the start. */
export const getLessonPosition = async (enrollmentId: string, lessonId: string) => {
  const progress = await prisma.progress.findUnique({
    where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
    select: { secondsWatched: true, completedAt: true },
  });

  return progress && !progress.completedAt ? progress.secondsWatched : 0;
};
