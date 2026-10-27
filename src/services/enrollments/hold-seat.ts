import { prisma } from '@/lib/prisma';

import { releaseExpiredHoldsIn } from './release-expired-holds';

/** How long an unpaid seat hold lasts before the seat is given back. */
export const SEAT_HOLD_MINUTES = 30;

/** Most unpaid seat holds one user may have across courses at once. */
export const MAX_ACTIVE_HOLDS = 2;

export class SessionFullError extends Error {
  constructor() {
    super('Session is full');
    this.name = 'SessionFullError';
  }
}

export class SessionUnavailableError extends Error {
  constructor() {
    super('Session is not available for this course');
    this.name = 'SessionUnavailableError';
  }
}

export class AlreadyEnrolledError extends Error {
  constructor() {
    super('User is already enrolled in this course');
    this.name = 'AlreadyEnrolledError';
  }
}

export class TooManyHoldsError extends Error {
  constructor() {
    super('Too many unpaid seat holds');
    this.name = 'TooManyHoldsError';
  }
}

export const holdSeat = ({
  userId,
  courseId,
  sessionId,
  now = new Date(),
}: {
  userId: string;
  courseId: string;
  sessionId: string;
  now?: Date;
}) =>
  prisma.$transaction(async (tx) => {
    const session = await tx.courseSession.findUnique({
      where: { id: sessionId },
      select: { courseId: true, startsAt: true },
    });
    if (!session || session.courseId !== courseId || session.startsAt <= now) {
      throw new SessionUnavailableError();
    }

    await releaseExpiredHoldsIn(tx, { sessionId, now });

    const findExisting = () =>
      tx.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
        select: { id: true, status: true, sessionId: true, holdExpiresAt: true },
      });
    let existing = await findExisting();
    // The user's own lapsed hold may sit on another session of this course.
    if (
      existing?.status === 'pending' &&
      existing.sessionId &&
      existing.sessionId !== sessionId &&
      existing.holdExpiresAt &&
      existing.holdExpiresAt < now
    ) {
      await releaseExpiredHoldsIn(tx, { sessionId: existing.sessionId, now });
      existing = await findExisting();
    }
    if (existing && existing.status !== 'cancelled') throw new AlreadyEnrolledError();

    const activeHolds = await tx.enrollment.count({
      where: { userId, status: 'pending', holdExpiresAt: { gt: now }, NOT: { courseId } },
    });
    if (activeHolds >= MAX_ACTIVE_HOLDS) throw new TooManyHoldsError();

    const hold = {
      sessionId,
      status: 'pending' as const,
      holdExpiresAt: new Date(now.getTime() + SEAT_HOLD_MINUTES * 60_000),
    };
    // Claim a cancelled row first: of two parallel requests only one matches, the other is a duplicate.
    let reactivated: { id: string; status: string; holdExpiresAt: Date | null } | undefined;
    if (existing) {
      const rows = await tx.enrollment.updateManyAndReturn({
        where: { id: existing.id, status: 'cancelled' },
        data: hold,
      });
      if (rows.length === 0) throw new AlreadyEnrolledError();
      reactivated = rows[0];
    }

    // One conditional statement: the capacity check and the increment cannot interleave.
    const { count } = await tx.courseSession.updateMany({
      where: { id: sessionId, seatsBooked: { lt: tx.courseSession.fields.capacity } },
      data: { seatsBooked: { increment: 1 } },
    });
    if (count === 0) throw new SessionFullError();

    return reactivated ?? tx.enrollment.create({ data: { userId, courseId, ...hold } });
  });
