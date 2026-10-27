import { prisma } from '@/lib/prisma';

import { AlreadyEnrolledError, holdSeat } from './hold-seat';

export class CourseUnavailableError extends Error {
  constructor() {
    super('Course is not available');
    this.name = 'CourseUnavailableError';
  }
}

export class SessionRequiredError extends Error {
  constructor() {
    super('This course requires a session to be chosen');
    this.name = 'SessionRequiredError';
  }
}

export class SessionNotAllowedError extends Error {
  constructor() {
    super('Online courses do not take a session');
    this.name = 'SessionNotAllowedError';
  }
}

const isUniqueViolation = (error: unknown) =>
  typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 'P2002';

/** Single entry point for enrolment: at most one `Enrollment` per user and course. */
export const enrolInCourse = async ({
  userId,
  courseId,
  sessionId,
}: {
  userId: string;
  courseId: string;
  sessionId?: string;
}) => {
  const course = await prisma.course.findFirst({
    where: { id: courseId, isActive: true },
    select: { format: true, priceVnd: true },
  });
  if (!course) throw new CourseUnavailableError();

  if (course.format !== 'online') {
    if (!sessionId) throw new SessionRequiredError();
    try {
      return await holdSeat({ userId, courseId, sessionId });
    } catch (error) {
      if (isUniqueViolation(error)) throw new AlreadyEnrolledError();
      throw error;
    }
  }
  if (sessionId) throw new SessionNotAllowedError();

  // Free courses are usable at once; paid ones wait for course checkout to activate them.
  const status = course.priceVnd > 0 ? ('pending' as const) : ('active' as const);
  try {
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true, status: true },
    });
    if (existing && existing.status !== 'cancelled') throw new AlreadyEnrolledError();
    const data = { status, sessionId: null, holdExpiresAt: null };
    return existing
      ? await prisma.enrollment.update({ where: { id: existing.id }, data })
      : await prisma.enrollment.create({ data: { userId, courseId, ...data } });
  } catch (error) {
    if (isUniqueViolation(error)) throw new AlreadyEnrolledError();
    throw error;
  }
};
