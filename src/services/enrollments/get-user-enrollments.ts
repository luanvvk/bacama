import type { $Enums } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export interface UserEnrollment {
  id: string;
  status: Exclude<$Enums.EnrollmentStatus, 'cancelled'>;
  holdExpiresAt: Date | null;
  course: {
    slug: string;
    name: string;
    imageUrl?: string;
    format: $Enums.CourseFormat;
  };
  sessionStartsAt: Date | null;
  siteName: string | null;
  /** Completed lessons over total lessons, 0–100; null when the course has no lessons. */
  progressPercent: number | null;
}

/** The signed-in user's own enrolments, newest first, cancelled ones excluded.
 * Ownership is filtered in the query itself, never after fetching. */
export const getUserEnrollments = async (userId: string): Promise<UserEnrollment[]> => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: { not: 'cancelled' } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      holdExpiresAt: true,
      course: {
        select: {
          slug: true,
          titleEn: true,
          imageUrl: true,
          format: true,
          modules: { select: { _count: { select: { lessons: true } } } },
        },
      },
      session: { select: { startsAt: true, site: { select: { nameEn: true } } } },
      progress: { where: { completedAt: { not: null } }, select: { id: true } },
    },
  });

  return enrollments.map((enrollment) => {
    const totalLessons = enrollment.course.modules.reduce(
      (sum, courseModule) => sum + courseModule._count.lessons,
      0,
    );

    return {
      id: enrollment.id,
      status: enrollment.status as UserEnrollment['status'],
      holdExpiresAt: enrollment.holdExpiresAt,
      course: {
        slug: enrollment.course.slug,
        name: enrollment.course.titleEn,
        imageUrl: enrollment.course.imageUrl ?? undefined,
        format: enrollment.course.format,
      },
      sessionStartsAt: enrollment.session?.startsAt ?? null,
      siteName: enrollment.session?.site.nameEn ?? null,
      progressPercent:
        totalLessons === 0
          ? null
          : Math.min(100, Math.round((enrollment.progress.length / totalLessons) * 100)),
    };
  });
};
