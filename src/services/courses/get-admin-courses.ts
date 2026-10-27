import type { Role } from '@/lib/providers/auth/types';
import { prisma } from '@/lib/prisma';

import type { CourseFormat } from './map-course';

export interface AdminCourse {
  id: string;
  name: string;
  meta?: string;
  format: CourseFormat;
  priceVnd: number;
  instructorName: string | null;
  /** Enrolments that still hold a place: everything except cancelled. */
  enrolled: number;
  /** Seats across upcoming sessions; null for online courses, which have no cap. */
  seatCapacity: number | null;
  /** Seats taken across upcoming sessions; null when `seatCapacity` is. */
  seatsBooked: number | null;
  /** Next upcoming session; null for online courses or when none is scheduled. */
  nextStartsAt: Date | null;
}

export interface AdminCourses {
  courses: AdminCourse[];
  students: number;
}

const FORMAT: Record<'online' | 'in_person' | 'hybrid', CourseFormat> = {
  online: 'online',
  in_person: 'in-person',
  hybrid: 'hybrid',
};

/** Admins see every course; an instructor sees only the ones assigned to them. */
export const getAdminCourses = async (
  user: { id: string; role: Role },
  now: Date = new Date(),
): Promise<AdminCourses> => {
  const rows = await prisma.course.findMany({
    where: user.role === 'admin' ? {} : { instructorId: user.id },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      titleEn: true,
      metaEn: true,
      format: true,
      priceVnd: true,
      instructor: { select: { name: true } },
      sessions: {
        where: { startsAt: { gte: now } },
        orderBy: { startsAt: 'asc' },
        select: { startsAt: true, capacity: true, seatsBooked: true },
      },
      _count: { select: { enrollments: { where: { status: { not: 'cancelled' } } } } },
    },
  });

  const courses = rows.map((row): AdminCourse => {
    const seatLimited = row.format !== 'online';

    return {
      id: row.id,
      name: row.titleEn,
      meta: row.metaEn ?? undefined,
      format: FORMAT[row.format],
      priceVnd: row.priceVnd,
      instructorName: row.instructor?.name ?? null,
      enrolled: row._count.enrollments,
      seatCapacity: seatLimited ? row.sessions.reduce((sum, s) => sum + s.capacity, 0) : null,
      seatsBooked: seatLimited ? row.sessions.reduce((sum, s) => sum + s.seatsBooked, 0) : null,
      nextStartsAt: seatLimited ? (row.sessions[0]?.startsAt ?? null) : null,
    };
  });

  return { courses, students: courses.reduce((sum, course) => sum + course.enrolled, 0) };
};
