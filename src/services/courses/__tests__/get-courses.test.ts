jest.mock('@/lib/prisma', () => ({
  prisma: { course: { findMany: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getCourses } from '../get-courses';

const mockFindMany = prisma.course.findMany as jest.Mock;

describe('getCourses', () => {
  afterEach(() => {
    mockFindMany.mockReset();
  });

  it('queries active courses in catalogue order', async () => {
    mockFindMany.mockResolvedValue([]);

    await getCourses();

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('maps rows through mapCourse', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'course-1',
        slug: 'viennoiserie',
        format: 'in_person',
        titleEn: 'Viennoiserie Weekend',
        metaEn: 'Hội An · weekend',
        descriptionEn: 'Two days in Hội An',
        availabilityEn: 'Limited seats',
        imageUrl: null,
        priceVnd: 3_200_000,
      },
    ]);

    const result = await getCourses();

    expect(result).toEqual([
      expect.objectContaining({
        slug: 'viennoiserie',
        format: 'in-person',
        ctaLabel: 'Book a seat',
      }),
    ]);
  });
});
