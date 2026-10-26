jest.mock('@/lib/prisma', () => ({
  prisma: { order: { findMany: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { ACCOUNT_ORDERS_LIMIT, getOrdersForUser } from '../get-orders-for-user';

const mockFindMany = prisma.order.findMany as jest.Mock;

describe('getOrdersForUser', () => {
  afterEach(() => mockFindMany.mockReset());

  it('filters by owner, newest first, capped at the limit', async () => {
    mockFindMany.mockResolvedValue([]);

    await getOrdersForUser('user-1');

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: ACCOUNT_ORDERS_LIMIT,
      }),
    );
    expect(ACCOUNT_ORDERS_LIMIT).toBe(20);
  });

  it('returns a DTO with item names and no PII', async () => {
    const createdAt = new Date('2026-01-02T00:00:00Z');
    mockFindMany.mockResolvedValue([
      {
        ref: 'BCM-1',
        createdAt,
        status: 'paid',
        totalVnd: 120000,
        items: [{ nameSnapshot: 'Espresso' }, { nameSnapshot: 'Croissant' }],
      },
    ]);

    const result = await getOrdersForUser('user-1');

    expect(result).toEqual([
      {
        ref: 'BCM-1',
        createdAt,
        status: 'paid',
        totalVnd: 120000,
        itemNames: ['Espresso', 'Croissant'],
      },
    ]);
    const select = mockFindMany.mock.calls[0][0].select;
    expect(select).not.toHaveProperty('phone');
    expect(select).not.toHaveProperty('email');
    expect(select).not.toHaveProperty('addressLine');
  });
});
