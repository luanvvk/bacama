jest.mock('@/lib/prisma', () => ({
  prisma: { order: { updateMany: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { expirePendingOrders, PENDING_ORDER_TTL_MS } from '../expire-pending-orders';

const mockUpdateMany = prisma.order.updateMany as jest.Mock;
const now = new Date('2026-01-10T12:00:00Z');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('expirePendingOrders', () => {
  it('fails only pending orders older than the default 24h cutoff', async () => {
    mockUpdateMany.mockResolvedValue({ count: 3 });

    await expect(expirePendingOrders(now)).resolves.toEqual({ expired: 3 });

    expect(mockUpdateMany).toHaveBeenCalledTimes(1);
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: {
        status: 'pending',
        createdAt: { lt: new Date(now.getTime() - PENDING_ORDER_TTL_MS) },
      },
      data: { status: 'failed' },
    });
  });

  it('honours a custom ttl', async () => {
    mockUpdateMany.mockResolvedValue({ count: 0 });

    await expirePendingOrders(now, 60_000);

    expect(mockUpdateMany.mock.calls[0][0].where.createdAt).toEqual({
      lt: new Date(now.getTime() - 60_000),
    });
  });

  it('never writes anything but status and never touches stock or other statuses', async () => {
    mockUpdateMany.mockResolvedValue({ count: 1 });

    await expirePendingOrders(now);

    const args = mockUpdateMany.mock.calls[0][0];
    expect(args.where.status).toBe('pending');
    expect(args.data).toEqual({ status: 'failed' });
  });

  it('returns 0 on a second run', async () => {
    mockUpdateMany.mockResolvedValueOnce({ count: 2 }).mockResolvedValueOnce({ count: 0 });

    await expirePendingOrders(now);
    await expect(expirePendingOrders(now)).resolves.toEqual({ expired: 0 });
  });
});
