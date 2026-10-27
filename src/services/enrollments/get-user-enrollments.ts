import type { $Enums } from '@/generated/prisma/client';
import { pickLocalized, type AppLocale } from '@/lib/localize';
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
export const getUserEnrollments = async (
  userId: string,
  locale: AppLocale,
  now: Date = new Date(),
): Promise<UserEnrollment[]> => {
  const enrollments = await prisma.enrollment.findMany({
    // A pending hold past its deadline is lapsed even if the daily sweep hasn't cancelled it yet.
    where: {
      userId,
      status: { not: 'cancelled' },
      OR: [
        { status: { not: 'pending' } },
        { holdExpiresAt: null },
        { holdExpiresAt: { gte: now } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      holdExpiresAt: true,
      course: {
        select: {
          slug: true,
          titleVi: true,
          titleEn: true,
          imageUrl: true,
          format: true,
          modules: { select: { _count: { select: { lessons: true } } } },
        },
      },
      session: { select: { startsAt: true, site: { select: { nameVi: true, nameEn: true } } } },
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
        name: pickLocalized(locale, enrollment.course.titleVi, enrollment.course.titleEn),
        imageUrl: enrollment.course.imageUrl ?? undefined,
        format: enrollment.course.format,
      },
      sessionStartsAt: enrollment.session?.startsAt ?? null,
      siteName: enrollment.session
        ? pickLocalized(locale, enrollment.session.site.nameVi, enrollment.session.site.nameEn)
        : null,
      progressPercent:
        totalLessons === 0
          ? null
          : Math.min(100, Math.round((enrollment.progress.length / totalLessons) * 100)),
    };
  });
};
