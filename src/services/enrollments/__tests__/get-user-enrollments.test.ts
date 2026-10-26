jest.mock('@/lib/prisma', () => ({
  prisma: { enrollment: { findMany: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getUserEnrollments } from '../get-user-enrollments';

const row = (lessonCounts: number[], completed: number, overrides = {}) => ({
  id: 'e1',
  status: 'active',
  holdExpiresAt: null,
  course: {
    slug: 'espresso-basics',
    titleEn: 'Espresso basics',
    imageUrl: null,
    format: 'online',
    modules: lessonCounts.map((lessons) => ({ _count: { lessons } })),
  },
  session: null,
  progress: Array.from({ length: completed }, (_, i) => ({ id: `p${i}` })),
  ...overrides,
});

const findMany = prisma.enrollment.findMany as jest.Mock;

describe('getUserEnrollments', () => {
  beforeEach(() => findMany.mockReset());

  it('filters on userId, excludes cancelled and orders newest first in the database call', async () => {
    findMany.mockResolvedValue([]);

    await getUserEnrollments('user-1');

    const args = findMany.mock.calls[0][0];
    expect(args.where).toEqual({ userId: 'user-1', status: { not: 'cancelled' } });
    expect(args.orderBy).toEqual({ createdAt: 'desc' });
  });

  it('does not filter in JavaScript: returns exactly what the query returns', async () => {
    findMany.mockResolvedValue([row([2], 0)]);

    await expect(getUserEnrollments('user-1')).resolves.toHaveLength(1);
  });

  it.each([
    [[4], 0, 0],
    [[2, 2], 1, 25],
    [[3], 3, 100],
  ])('computes progress for lessons %j with %i completed as %i%%', async (counts, done, pct) => {
    findMany.mockResolvedValue([row(counts, done)]);

    const [result] = await getUserEnrollments('user-1');

    expect(result.progressPercent).toBe(pct);
  });

  it('returns null progress for a course without lessons', async () => {
    findMany.mockResolvedValue([row([], 0)]);

    const [result] = await getUserEnrollments('user-1');

    expect(result.progressPercent).toBeNull();
  });

  it('maps session start and site name when present', async () => {
    const startsAt = new Date('2026-11-01T02:00:00Z');
    findMany.mockResolvedValue([row([], 0, { session: { startsAt, site: { nameEn: 'Saigon' } } })]);

    const [result] = await getUserEnrollments('user-1');

    expect(result.sessionStartsAt).toEqual(startsAt);
    expect(result.siteName).toBe('Saigon');
  });
});
