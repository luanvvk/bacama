jest.mock('@/lib/prisma', () => ({
  prisma: { order: { count: jest.fn() }, enrollment: { count: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getAccountSummary } from '../get-account-summary';

describe('getAccountSummary', () => {
  it('counts the user’s orders and active enrolments only', async () => {
    (prisma.order.count as jest.Mock).mockResolvedValue(3);
    (prisma.enrollment.count as jest.Mock).mockResolvedValue(2);

    await expect(getAccountSummary('user-1')).resolves.toEqual({
      orderCount: 3,
      activeEnrollmentCount: 2,
    });
    expect(prisma.order.count).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(prisma.enrollment.count).toHaveBeenCalledWith({
      where: { userId: 'user-1', status: 'active' },
    });
  });
});
