import { prisma } from '@/lib/prisma';

export type PaymentOutcome =
  'not_found' | 'amount_mismatch' | 'updated' | 'already_processed' | 'needs_review';

const findOrder = (providerRef: string) =>
  prisma.order.findUnique({
    where: { providerRef },
    select: {
      id: true,
      ref: true,
      totalVnd: true,
      items: { select: { productId: true, quantity: true } },
    },
  });

/**
 * Moves a `pending` order to `paid` and commits stock. The status change is a
 * conditional update, so a replayed webhook affects 0 rows and never
 * decrements twice. A paid event for an order the sweep already failed, or for
 * stock that ran out meanwhile, moves it to `needs_review` for a human (lines
 * that did have stock stay decremented; restock by hand if it is refunded).
 * `amountVnd` (from the gateway) is required: a missing or different amount is
 * a mismatch. It is only compared with the stored total, never written.
 */
export const markOrderPaid = async (
  providerRef: string,
  amountVnd: number | undefined,
): Promise<PaymentOutcome> => {
  const order = await findOrder(providerRef);
  if (!order) return 'not_found';
  if (amountVnd !== order.totalVnd) {
    console.error(`Payment webhook: amount mismatch or missing for order ${order.ref}`);
    return 'amount_mismatch';
  }

  const quantities = new Map<string, number>();
  for (const { productId, quantity } of order.items) {
    if (productId) quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
  }

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id: order.id, status: 'pending' },
      data: { status: 'paid', paidAt: new Date() },
    });
    if (count !== 1) {
      const late = await tx.order.updateMany({
        where: { id: order.id, status: 'failed' },
        data: { status: 'needs_review', paidAt: new Date() },
      });
      if (late.count !== 1) return 'already_processed';
      console.error(`Payment webhook: paid event for expired order ${order.ref}, needs review`);
      return 'needs_review';
    }

    let short = false;

    for (const [productId, quantity] of quantities) {
      const result = await tx.product.updateMany({
        where: { id: productId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (result.count === 0) short = true;
    }
    if (short) {
      // Payment is already taken: flag it for a human rather than ship what we can't.
      await tx.order.update({ where: { id: order.id }, data: { status: 'needs_review' } });
      console.error(`Payment webhook: insufficient stock for order ${order.ref}, needs review`);
      return 'needs_review';
    }
    return 'updated';
  });
};

export const markOrderFailed = async (providerRef: string): Promise<PaymentOutcome> => {
  const order = await findOrder(providerRef);
  if (!order) return 'not_found';

  const { count } = await prisma.order.updateMany({
    where: { id: order.id, status: 'pending' },
    data: { status: 'failed' },
  });
  return count === 1 ? 'updated' : 'already_processed';
};
