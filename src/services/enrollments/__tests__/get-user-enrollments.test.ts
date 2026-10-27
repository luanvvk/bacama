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

    const now = new Date('2026-10-27T00:00:00Z');
    await getUserEnrollments('user-1', 'en', now);

    const args = findMany.mock.calls[0][0];
    expect(args.where).toEqual({
      userId: 'user-1',
      status: { not: 'cancelled' },
      OR: [
        { status: { not: 'pending' } },
        { holdExpiresAt: null },
        { holdExpiresAt: { gte: now } },
      ],
    });
    expect(args.orderBy).toEqual({ createdAt: 'desc' });
  });

  it('does not filter in JavaScript: returns exactly what the query returns', async () => {
    findMany.mockResolvedValue([row([2], 0)]);

    await expect(getUserEnrollments('user-1', 'en')).resolves.toHaveLength(1);
  });

  it.each([
    [[4], 0, 0],
    [[2, 2], 1, 25],
    [[3], 3, 100],
  ])('computes progress for lessons %j with %i completed as %i%%', async (counts, done, pct) => {
    findMany.mockResolvedValue([row(counts, done)]);

    const [result] = await getUserEnrollments('user-1', 'en');

    expect(result.progressPercent).toBe(pct);
  });

  it('returns null progress for a course without lessons', async () => {
    findMany.mockResolvedValue([row([], 0)]);

    const [result] = await getUserEnrollments('user-1', 'en');

    expect(result.progressPercent).toBeNull();
  });

  it('maps session start and site name when present', async () => {
    const startsAt = new Date('2026-11-01T02:00:00Z');
    findMany.mockResolvedValue([row([], 0, { session: { startsAt, site: { nameEn: 'Saigon' } } })]);

    const [result] = await getUserEnrollments('user-1', 'en');

    expect(result.sessionStartsAt).toEqual(startsAt);
    expect(result.siteName).toBe('Saigon');
  });
});

describe('getUserEnrollments locale', () => {
  it('returns Vi course and site names on vi', async () => {
    const base = row([], 0);
    findMany.mockResolvedValue([
      row([], 0, {
        course: { ...base.course, titleVi: 'Cà phê cơ bản' },
        session: { startsAt: new Date(), site: { nameVi: 'Sài Gòn', nameEn: 'Saigon' } },
      }),
    ]);

    const [result] = await getUserEnrollments('user-1', 'vi');

    expect(result.course.name).toBe('Cà phê cơ bản');
    expect(result.siteName).toBe('Sài Gòn');
  });

  it('falls back to En when the Vi title is empty', async () => {
    const base = row([], 0);
    findMany.mockResolvedValue([row([], 0, { course: { ...base.course, titleVi: '' } })]);

    const [result] = await getUserEnrollments('user-1', 'vi');

    expect(result.course.name).toBe('Espresso basics');
  });
});
