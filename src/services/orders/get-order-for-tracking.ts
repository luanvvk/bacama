import { prisma } from '@/lib/prisma';
import type { CheckoutOrder } from '@/stores/checkout';

import { mapOrderToCheckoutOrder } from './map-order';

const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

/**
 * Guest order tracking lookup (task 2.11) — ref alone is not enough here,
 * since a ref could be typed in or shared later, not just seen once right
 * after purchase. Requires the phone on the order to match. Returns null
 * for both "no such order" and "wrong phone" so the ref stays non-enumerable.
 */
export const getOrderForTracking = async (
  ref: string,
  phone: string,
): Promise<CheckoutOrder | null> => {
  const order = await prisma.order.findUnique({ where: { ref }, include: { items: true } });

  if (!order || normalizePhone(order.phone) !== normalizePhone(phone)) {
    return null;
  }

  return mapOrderToCheckoutOrder(order);
};
