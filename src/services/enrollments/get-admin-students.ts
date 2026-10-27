import type { $Enums } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export const ADMIN_STUDENTS_LIMIT = 200;

export interface AdminStudent {
  enrollmentId: string;
  name: string;
  email: string;
  courseTitle: string;
  /** Completed lessons over total lessons, 0–100; 0 when the course has no lessons. */
  progressPercent: number;
  status: $Enums.EnrollmentStatus;
}

export interface AdminStudents {
  students: AdminStudent[];
  /** All enrolments, before the row cap. */
  total: number;
}

/** One row per enrolment: a student is derived from `Enrollment`, never from a role filter. */
export const getAdminStudents = async (): Promise<AdminStudents> => {
  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      orderBy: { createdAt: 'desc' },
      take: ADMIN_STUDENTS_LIMIT,
      select: {
        id: true,
        status: true,
        user: { select: { name: true, email: true } },
        course: {
          select: {
            titleEn: true,
            modules: { select: { _count: { select: { lessons: true } } } },
          },
        },
        progress: { where: { completedAt: { not: null } }, select: { id: true } },
      },
    }),
    prisma.enrollment.count(),
  ]);

  const students = enrollments.map((enrollment) => {
    const totalLessons = enrollment.course.modules.reduce(
      (sum, courseModule) => sum + courseModule._count.lessons,
      0,
    );

    return {
      enrollmentId: enrollment.id,
      name: enrollment.user.name,
      email: enrollment.user.email,
      courseTitle: enrollment.course.titleEn,
      progressPercent:
        totalLessons === 0
          ? 0
          : Math.min(100, Math.round((enrollment.progress.length / totalLessons) * 100)),
      status: enrollment.status,
    };
  });

  return { students, total };
};
