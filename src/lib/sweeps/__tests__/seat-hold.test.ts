type Enrollment = {
  id: string;
  sessionId: string;
  status: string;
  holdExpiresAt: Date | null;
};

const enrollments: Enrollment[] = [];
const sessions: Record<string, number> = {};

jest.mock('@/lib/prisma', () => {
  const tx = {
    enrollment: {
      findMany: jest.fn(async ({ where }) =>
        enrollments.filter(
          (e) =>
            e.status === where.status &&
            e.holdExpiresAt !== null &&
            e.holdExpiresAt < where.holdExpiresAt.lt,
        ),
      ),
      updateManyAndReturn: jest.fn(async ({ where, data }) => {
        const hit = enrollments.filter(
          (e) => where.id.in.includes(e.id) && e.status === where.status,
        );
        hit.forEach((e) => Object.assign(e, data));
        return hit.map((e) => ({ sessionId: e.sessionId }));
      }),
    },
    courseSession: {
      updateMany: jest.fn(async ({ where, data }) => {
        sessions[where.id] = data.seatsBooked.decrement
          ? sessions[where.id] - data.seatsBooked.decrement
          : data.seatsBooked;
        return { count: 1 };
      }),
    },
  };
  return { prisma: { $transaction: (fn: (t: typeof tx) => unknown) => fn(tx) } };
});

import { releaseSeatHolds } from '../seat-hold';

const now = new Date('2026-01-01T10:00:00Z');
const past = new Date('2026-01-01T09:00:00Z');
const future = new Date('2026-01-01T11:00:00Z');

describe('releaseSeatHolds', () => {
  it('cancels only expired pending holds, per session, and is idempotent', async () => {
    sessions.s1 = 3;
    sessions.s2 = 2;
    enrollments.push(
      { id: 'a', sessionId: 's1', status: 'pending', holdExpiresAt: past },
      { id: 'b', sessionId: 's1', status: 'pending', holdExpiresAt: past },
      { id: 'c', sessionId: 's2', status: 'pending', holdExpiresAt: past },
      { id: 'd', sessionId: 's2', status: 'pending', holdExpiresAt: future },
      { id: 'e', sessionId: 's2', status: 'active', holdExpiresAt: past },
    );

    expect(await releaseSeatHolds(now)).toEqual({ released: 3 });
    expect(enrollments.map((e) => e.status)).toEqual([
      'cancelled',
      'cancelled',
      'cancelled',
      'pending',
      'active',
    ]);
    expect(sessions).toEqual({ s1: 1, s2: 1 });

    expect(await releaseSeatHolds(now)).toEqual({ released: 0 });
    expect(sessions).toEqual({ s1: 1, s2: 1 });
  });
});
