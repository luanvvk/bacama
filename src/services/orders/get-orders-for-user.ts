import { prisma } from '@/lib/prisma';
import type { $Enums } from '@/generated/prisma/client';

export const ACCOUNT_ORDERS_LIMIT = 20;

export interface AccountOrder {
  ref: string;
  createdAt: Date;
  status: $Enums.OrderStatus;
  totalVnd: number;
  itemNames: string[];
}

/** The signed-in user's own orders, newest first. Ownership is filtered in the
 * query itself, and the DTO deliberately omits phone, email and address. */
export const getOrdersForUser = async (userId: string): Promise<AccountOrder[]> => {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: ACCOUNT_ORDERS_LIMIT,
    select: {
      ref: true,
      createdAt: true,
      status: true,
      totalVnd: true,
      items: { select: { nameSnapshot: true } },
    },
  });

  return orders.map((order) => ({
    ref: order.ref,
    createdAt: order.createdAt,
    status: order.status,
    totalVnd: order.totalVnd,
    itemNames: order.items.map((item) => item.nameSnapshot),
  }));
};
