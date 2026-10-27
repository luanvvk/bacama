import { prisma } from '@/lib/prisma';
import type { CheckoutOrder } from '@/stores/checkout';

import { mapOrderToCheckoutOrder } from './map-order';

export interface OrderViewer {
  userId: string | null;
  /** The visitor holds a valid signed access cookie for this ref. */
  hasAccessCookie: boolean;
}

/**
 * Lookup for the checkout confirmation page. The order carries customer PII,
 * so it is only returned to its owner: the signed-in user who placed it, or
 * the browser that placed it (signed cookie set at order creation). Anyone
 * else gets null, same as "no such order".
 */
export const getOrderByRef = async (
  ref: string,
  viewer: OrderViewer,
): Promise<CheckoutOrder | null> => {
  const order = await prisma.order.findUnique({ where: { ref }, include: { items: true } });
  if (!order) return null;

  const isOwner = viewer.hasAccessCookie || (!!viewer.userId && order.userId === viewer.userId);
  return isOwner ? mapOrderToCheckoutOrder(order) : null;
};
