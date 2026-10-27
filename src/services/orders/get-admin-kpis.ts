import { getVietnamDayRange } from '@/lib/vietnam-day';
import { prisma } from '@/lib/prisma';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface AdminKpis {
  ordersToday: number;
  /** Change vs yesterday, absolute; null when yesterday had no orders. */
  ordersDelta: number | null;
  revenueTodayVnd: number;
  /** Percent change vs yesterday, rounded; null when yesterday had no revenue. */
  revenueDeltaPercent: number | null;
  awaitingDespatch: number;
  signUpsLast7Days: number;
  /** Change vs the previous 7 days; null when that week had no sign-ups. */
  signUpsDelta: number | null;
}

const COUNTED_ORDER_STATUSES = [
  'paid',
  'awaiting_cod',
  'shipped',
  'delivered',
  'completed',
] as const;
const ENROLLED_STATUSES = ['active', 'completed'] as const;

/** Online-only metrics (no POS data). Orders are bucketed by Vietnam local day. */
export const getAdminKpis = async (now = new Date()): Promise<AdminKpis> => {
  const { start, end, yesterdayStart } = getVietnamDayRange(now);
  const weekStart = new Date(now.getTime() - WEEK_MS);
  const prevWeekStart = new Date(now.getTime() - 2 * WEEK_MS);

  const orderTotals = (from: Date, to: Date) =>
    prisma.order.aggregate({
      where: { status: { in: [...COUNTED_ORDER_STATUSES] }, createdAt: { gte: from, lt: to } },
      _count: { _all: true },
      _sum: { totalVnd: true },
    });

  const signUps = (from: Date, to: Date) =>
    prisma.enrollment.count({
      where: { status: { in: [...ENROLLED_STATUSES] }, createdAt: { gte: from, lt: to } },
    });

  const [today, yesterday, awaitingDespatch, signUpsLast7Days, signUpsPrev7Days] =
    await Promise.all([
      orderTotals(start, end),
      orderTotals(yesterdayStart, start),
      prisma.order.count({
        where: {
          status: { in: ['paid', 'awaiting_cod'] },
          deliveryMode: 'home_delivery',
          shipment: null,
        },
      }),
      signUps(weekStart, now),
      signUps(prevWeekStart, weekStart),
    ]);

  const revenueTodayVnd = today._sum.totalVnd ?? 0;
  const revenueYesterdayVnd = yesterday._sum.totalVnd ?? 0;

  return {
    ordersToday: today._count._all,
    ordersDelta: yesterday._count._all > 0 ? today._count._all - yesterday._count._all : null,
    revenueTodayVnd,
    revenueDeltaPercent:
      revenueYesterdayVnd > 0
        ? Math.round(((revenueTodayVnd - revenueYesterdayVnd) / revenueYesterdayVnd) * 100)
        : null,
    awaitingDespatch,
    signUpsLast7Days,
    signUpsDelta: signUpsPrev7Days > 0 ? signUpsLast7Days - signUpsPrev7Days : null,
  };
};
