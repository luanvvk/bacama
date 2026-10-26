import { prisma } from '@/lib/prisma';

export type PaymentOutcome = 'not_found' | 'amount_mismatch' | 'updated' | 'already_processed';

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
 * decrements twice. `amountVnd` (from the gateway) is only compared with the
 * stored total, never written.
 */
export const markOrderPaid = async (
  providerRef: string,
  amountVnd?: number,
): Promise<PaymentOutcome> => {
  const order = await findOrder(providerRef);
  if (!order) return 'not_found';
  if (amountVnd !== undefined && amountVnd !== order.totalVnd) return 'amount_mismatch';

  const quantities = new Map<string, number>();
  for (const { productId, quantity } of order.items) {
    if (productId) quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
  }

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id: order.id, status: 'pending' },
      data: { status: 'paid', paidAt: new Date() },
    });
    if (count !== 1) return 'already_processed';

    for (const [productId, quantity] of quantities) {
      const result = await tx.product.updateMany({
        where: { id: productId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      // Payment is already taken, so a short line must not undo the paid state.
      if (result.count === 0) {
        console.warn(`Payment webhook: insufficient stock for order ${order.ref}`);
      }
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
