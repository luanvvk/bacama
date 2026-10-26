import { prisma } from '@/lib/prisma';

export interface AccountSummary {
  orderCount: number;
  activeEnrollmentCount: number;
}

export const getAccountSummary = async (userId: string): Promise<AccountSummary> => {
  const [orderCount, activeEnrollmentCount] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.enrollment.count({ where: { userId, status: 'active' } }),
  ]);

  return { orderCount, activeEnrollmentCount };
};
