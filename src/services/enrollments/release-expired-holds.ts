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

  // Only rows still pending count, so a concurrent release never double-decrements.
  const { count } = await tx.enrollment.updateMany({
    where: { id: { in: expired.map((e) => e.id) }, status: 'pending' },
    data: { status: 'cancelled', holdExpiresAt: null },
  });
  if (count === 0) return { released: 0 };

  const perSession = new Map<string, number>();
  for (const { sessionId: id } of expired) {
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
  return { released: count };
};

/** Cancels expired pending seat holds and frees their seats; `active` rows are never touched. */
export const releaseExpiredHolds = (options: { sessionId?: string; now?: Date } = {}) =>
  prisma.$transaction((tx) => releaseExpiredHoldsIn(tx, options));
