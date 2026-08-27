import { prisma } from '@/lib/prisma';
import type { CheckoutOrder } from '@/stores/checkout';

import { mapOrderToCheckoutOrder } from './map-order';

/**
 * Ref-alone lookup for the checkout confirmation page. Safe without a phone
 * check because `ref` is a fresh 32-bit-random token the browser only sees
 * once, immediately after placing the order — unlike the guest order
 * tracking route (getOrderForTracking), which must assume the ref could be
 * typed in or shared later.
 */
export const getOrderByRef = async (ref: string): Promise<CheckoutOrder | null> => {
  const order = await prisma.order.findUnique({ where: { ref }, include: { items: true } });
  return order ? mapOrderToCheckoutOrder(order) : null;
};
