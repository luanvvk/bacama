jest.mock('@/lib/prisma', () => ({
  prisma: {
    courseSession: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      fields: { capacity: 'CAPACITY_REF' },
    },
    enrollment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      updateManyAndReturn: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import { prisma } from '@/lib/prisma';

import {
  AlreadyEnrolledError,
  holdSeat,
  SEAT_HOLD_MINUTES,
  SessionFullError,
  SessionUnavailableError,
} from '../hold-seat';

const session = prisma.courseSession as unknown as Record<string, jest.Mock>;
const enrollment = prisma.enrollment as unknown as Record<string, jest.Mock>;

const now = new Date('2026-01-01T10:00:00Z');
const args = { userId: 'u1', courseId: 'c1', sessionId: 's1', now };

beforeEach(() => {
  jest.resetAllMocks();
  (prisma.$transaction as jest.Mock).mockImplementation((fn) => fn(prisma));
  session.findUnique.mockResolvedValue({ courseId: 'c1', startsAt: new Date('2026-02-01') });
  session.updateMany.mockResolvedValue({ count: 1 });
  enrollment.findMany.mockResolvedValue([]);
  enrollment.findUnique.mockResolvedValue(null);
  enrollment.create.mockResolvedValue({ id: 'e1' });
  enrollment.update.mockResolvedValue({ id: 'e1' });
});

describe('holdSeat', () => {
  it('claims a seat conditionally and creates a pending hold', async () => {
    await holdSeat(args);
    expect(session.updateMany).toHaveBeenCalledWith({
      where: { id: 's1', seatsBooked: { lt: 'CAPACITY_REF' } },
      data: { seatsBooked: { increment: 1 } },
    });
    expect(enrollment.create).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        courseId: 'c1',
        sessionId: 's1',
        status: 'pending',
        holdExpiresAt: new Date(now.getTime() + SEAT_HOLD_MINUTES * 60_000),
      },
    });
  });

  it('throws SessionFullError and creates nothing when no seat is left', async () => {
    session.updateMany.mockResolvedValue({ count: 0 });
    await expect(holdSeat(args)).rejects.toBeInstanceOf(SessionFullError);
    expect(enrollment.create).not.toHaveBeenCalled();
  });

  it('rejects a session of another course', async () => {
    session.findUnique.mockResolvedValue({ courseId: 'other', startsAt: new Date('2026-02-01') });
    await expect(holdSeat(args)).rejects.toBeInstanceOf(SessionUnavailableError);
  });

  it('rejects a missing or already started session', async () => {
    session.findUnique.mockResolvedValue({ courseId: 'c1', startsAt: now });
    await expect(holdSeat(args)).rejects.toBeInstanceOf(SessionUnavailableError);
    session.findUnique.mockResolvedValue(null);
    await expect(holdSeat(args)).rejects.toBeInstanceOf(SessionUnavailableError);
    expect(session.updateMany).not.toHaveBeenCalled();
  });

  it.each(['pending', 'active', 'completed'])(
    'rejects an existing %s enrolment',
    async (status) => {
      enrollment.findUnique.mockResolvedValue({ id: 'e0', status });
      await expect(holdSeat(args)).rejects.toBeInstanceOf(AlreadyEnrolledError);
      expect(session.updateMany).not.toHaveBeenCalled();
    },
  );

  it('reuses a cancelled enrolment row', async () => {
    enrollment.findUnique.mockResolvedValue({ id: 'e0', status: 'cancelled' });
    await holdSeat(args);
    expect(enrollment.create).not.toHaveBeenCalled();
    expect(enrollment.update).toHaveBeenCalledWith({
      where: { id: 'e0' },
      data: expect.objectContaining({ sessionId: 's1', status: 'pending' }),
    });
  });

  it('releases expired holds before claiming a seat', async () => {
    enrollment.findMany.mockResolvedValue([{ id: 'x', sessionId: 's1' }]);
    enrollment.updateManyAndReturn.mockResolvedValue([{ sessionId: 's1' }]);
    await holdSeat(args);
    expect(session.updateMany).toHaveBeenNthCalledWith(1, {
      where: { id: 's1', seatsBooked: { gte: 1 } },
      data: { seatsBooked: { decrement: 1 } },
    });
    expect(session.updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: 's1', seatsBooked: { lt: 'CAPACITY_REF' } },
      data: { seatsBooked: { increment: 1 } },
    });
  });

  it("releases the user's own lapsed hold on another session of the course", async () => {
    enrollment.findUnique
      .mockResolvedValueOnce({
        id: 'e0',
        status: 'pending',
        sessionId: 's0',
        holdExpiresAt: new Date('2025-12-31'),
      })
      .mockResolvedValueOnce({
        id: 'e0',
        status: 'cancelled',
        sessionId: 's0',
        holdExpiresAt: null,
      });
    enrollment.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'e0', sessionId: 's0' }]);
    enrollment.updateManyAndReturn.mockResolvedValue([{ sessionId: 's0' }]);
    await holdSeat(args);
    expect(session.updateMany).toHaveBeenCalledWith({
      where: { id: 's0', seatsBooked: { gte: 1 } },
      data: { seatsBooked: { decrement: 1 } },
    });
    expect(enrollment.update).toHaveBeenCalledWith({
      where: { id: 'e0' },
      data: expect.objectContaining({ sessionId: 's1', status: 'pending' }),
    });
  });
});
