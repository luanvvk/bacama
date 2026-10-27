import { prisma } from '@/lib/prisma';

/** Server-only on purpose: an unlisted video id is the whole secret, so it is
 * kept off the outline types that get serialized to client components and is
 * read only after the access check for that lesson has passed. */
export const getLessonVideoId = async (lessonId: string): Promise<string | null> => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { videoId: true },
  });

  return lesson?.videoId ?? null;
};
