jest.mock('@/lib/prisma', () => ({
  prisma: { course: { findMany: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getFeaturedCourses } from '../get-featured-courses';

const mockFindMany = prisma.course.findMany as jest.Mock;

describe('getFeaturedCourses', () => {
  afterEach(() => {
    mockFindMany.mockReset();
  });

  it('takes three courses by default', async () => {
    mockFindMany.mockResolvedValue([]);

    await getFeaturedCourses();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true }, take: 3 }),
    );
  });

  it('honours an explicit limit', async () => {
    mockFindMany.mockResolvedValue([]);

    await getFeaturedCourses(1);

    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({ take: 1 }));
  });
});
