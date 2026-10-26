import { prisma } from '@/lib/prisma';

// Pending orders hold no stock, so the TTL only needs to outlast a slow gateway
// callback; a full day also fits Vercel Hobby's daily cron.
export const PENDING_ORDER_TTL_MS = 24 * 60 * 60 * 1000;

export const expirePendingOrders = async (
  now = new Date(),
  ttlMs = PENDING_ORDER_TTL_MS,
): Promise<{ expired: number }> => {
  const cutoff = new Date(now.getTime() - ttlMs);
  const { count } = await prisma.order.updateMany({
    where: { status: 'pending', createdAt: { lt: cutoff } },
    data: { status: 'failed' },
  });
  return { expired: count };
};
