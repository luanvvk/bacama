jest.mock('@/lib/prisma', () => ({
  prisma: {
    courseSession: { updateMany: jest.fn() },
    enrollment: { findMany: jest.fn(), updateMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

import { prisma } from '@/lib/prisma';

import { releaseExpiredHolds } from '../release-expired-holds';

const session = prisma.courseSession as unknown as Record<string, jest.Mock>;
const enrollment = prisma.enrollment as unknown as Record<string, jest.Mock>;
const now = new Date('2026-01-01T10:00:00Z');

beforeEach(() => {
  jest.resetAllMocks();
  (prisma.$transaction as jest.Mock).mockImplementation((fn) => fn(prisma));
  session.updateMany.mockResolvedValue({ count: 1 });
});

describe('releaseExpiredHolds', () => {
  it('only looks at pending holds and cancels them, freeing seats per session', async () => {
    enrollment.findMany.mockResolvedValue([
      { id: 'a', sessionId: 's1' },
      { id: 'b', sessionId: 's1' },
      { id: 'c', sessionId: 's2' },
    ]);
    enrollment.updateMany.mockResolvedValue({ count: 3 });

    expect(await releaseExpiredHolds({ now })).toEqual({ released: 3 });
    expect(enrollment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'pending', holdExpiresAt: { lt: now }, sessionId: { not: null } },
      }),
    );
    expect(enrollment.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['a', 'b', 'c'] }, status: 'pending' },
      data: { status: 'cancelled', holdExpiresAt: null },
    });
    expect(session.updateMany).toHaveBeenCalledWith({
      where: { id: 's1', seatsBooked: { gte: 2 } },
      data: { seatsBooked: { decrement: 2 } },
    });
    expect(session.updateMany).toHaveBeenCalledWith({
      where: { id: 's2', seatsBooked: { gte: 1 } },
      data: { seatsBooked: { decrement: 1 } },
    });
  });

  it('scopes to one session when asked', async () => {
    enrollment.findMany.mockResolvedValue([]);
    await releaseExpiredHolds({ sessionId: 's9', now });
    expect(enrollment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ sessionId: 's9' }) }),
    );
  });

  it('returns 0 on a second call and touches nothing', async () => {
    enrollment.findMany.mockResolvedValue([]);
    expect(await releaseExpiredHolds({ now })).toEqual({ released: 0 });
    expect(enrollment.updateMany).not.toHaveBeenCalled();
    expect(session.updateMany).not.toHaveBeenCalled();
  });

  it('clamps seatsBooked to 0 instead of going negative', async () => {
    enrollment.findMany.mockResolvedValue([{ id: 'a', sessionId: 's1' }]);
    enrollment.updateMany.mockResolvedValue({ count: 1 });
    session.updateMany.mockResolvedValueOnce({ count: 0 });
    await releaseExpiredHolds({ now });
    expect(session.updateMany).toHaveBeenLastCalledWith({
      where: { id: 's1' },
      data: { seatsBooked: 0 },
    });
  });
});
