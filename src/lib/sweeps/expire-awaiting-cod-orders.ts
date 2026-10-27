import { prisma } from '@/lib/prisma';

// COD orders commit stock at creation, so an order nobody confirms or collects
// must give it back. Override with COD_ORDER_TTL_DAYS.
export const DEFAULT_COD_ORDER_TTL_DAYS = 3;

const codOrderTtlMs = () => {
  const days = Number(process.env.COD_ORDER_TTL_DAYS);
  return (days > 0 ? days : DEFAULT_COD_ORDER_TTL_DAYS) * 24 * 60 * 60 * 1000;
};

export const expireAwaitingCodOrders = async (
  now = new Date(),
  ttlMs = codOrderTtlMs(),
): Promise<{ expired: number }> => {
  const stale = await prisma.order.findMany({
    where: { status: 'awaiting_cod', createdAt: { lt: new Date(now.getTime() - ttlMs) } },
    select: { id: true, items: { select: { productId: true, quantity: true } } },
  });

  let expired = 0;
  for (const order of stale) {
    // The status guard makes a concurrent confirmation or a second sweep a no-op.
    const released = await prisma.$transaction(async (tx) => {
      const { count } = await tx.order.updateMany({
        where: { id: order.id, status: 'awaiting_cod' },
        data: { status: 'failed' },
      });
      if (count === 0) return false;

      for (const item of order.items) {
        if (!item.productId) continue;
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      return true;
    });
    if (released) expired += 1;
  }

  return { expired };
};
