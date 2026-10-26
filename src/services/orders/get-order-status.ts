import { prisma } from '@/lib/prisma';
import type { $Enums } from '@/generated/prisma/client';

/** Status-only lookup for the pay screen's polling. Deliberately selects no
 * other column so no PII can leak through the public status endpoint. */
export const getOrderStatus = async (ref: string): Promise<$Enums.OrderStatus | null> => {
  const order = await prisma.order.findUnique({ where: { ref }, select: { status: true } });
  return order ? order.status : null;
};

/** `/checkout/done` only shows for orders that are actually paid or payable on delivery. */
export const canShowOrderDone = (status: $Enums.OrderStatus): boolean =>
  status === 'paid' || status === 'awaiting_cod';
