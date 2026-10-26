import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

type Tx = Prisma.TransactionClient;

export const releaseExpiredHoldsIn = async (
  tx: Tx,
  { sessionId, now = new Date() }: { sessionId?: string; now?: Date } = {},
): Promise<{ released: number }> => {
  const expired = await tx.enrollment.findMany({
    where: {
      status: 'pending',
      holdExpiresAt: { lt: now },
      sessionId: sessionId ?? { not: null },
    },
    select: { id: true, sessionId: true },
  });
  if (expired.length === 0) return { released: 0 };

  // Seats are freed only for rows this call actually cancelled, so a concurrent
  // release of the same holds never decrements twice.
  const cancelled = await tx.enrollment.updateManyAndReturn({
    where: { id: { in: expired.map((e) => e.id) }, status: 'pending' },
    data: { status: 'cancelled', holdExpiresAt: null },
    select: { sessionId: true },
  });

  const perSession = new Map<string, number>();
  for (const { sessionId: id } of cancelled) {
    if (id) perSession.set(id, (perSession.get(id) ?? 0) + 1);
  }
  for (const [id, n] of perSession) {
    const { count: decremented } = await tx.courseSession.updateMany({
      where: { id, seatsBooked: { gte: n } },
      data: { seatsBooked: { decrement: n } },
    });
    if (decremented === 0) {
      await tx.courseSession.updateMany({ where: { id }, data: { seatsBooked: 0 } });
    }
  }
  return { released: cancelled.length };
};

/** Cancels expired pending seat holds and frees their seats; `active` rows are never touched. */
export const releaseExpiredHolds = (options: { sessionId?: string; now?: Date } = {}) =>
  prisma.$transaction((tx) => releaseExpiredHoldsIn(tx, options));
