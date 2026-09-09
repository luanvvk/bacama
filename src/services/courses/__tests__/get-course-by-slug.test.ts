jest.mock('@/lib/prisma', () => ({
  prisma: { course: { findFirst: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getCourseBySlug } from '../get-course-by-slug';

const mockFindFirst = prisma.course.findFirst as jest.Mock;

describe('getCourseBySlug', () => {
  afterEach(() => {
    mockFindFirst.mockReset();
  });

  it('only looks up active courses by slug', async () => {
    mockFindFirst.mockResolvedValue(null);
    const now = new Date('2026-09-14T00:00:00.000Z');

    await getCourseBySlug('latte-art', now);

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'latte-art', isActive: true } }),
    );
  });

  it('only includes sessions from now onward', async () => {
    mockFindFirst.mockResolvedValue(null);
    const now = new Date('2026-09-14T00:00:00.000Z');

    await getCourseBySlug('viennoiserie', now);

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          sessions: expect.objectContaining({ where: { startsAt: { gte: now } } }),
        }),
      }),
    );
  });

  it('returns null when no course matches', async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(getCourseBySlug('missing')).resolves.toBeNull();
  });
});
