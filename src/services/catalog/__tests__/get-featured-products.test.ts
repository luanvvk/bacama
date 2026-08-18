jest.mock('@/lib/prisma', () => ({
  prisma: { product: { findMany: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getFeaturedProducts } from '../get-featured-products';

const mockFindMany = prisma.product.findMany as jest.Mock;

describe('getFeaturedProducts', () => {
  afterEach(() => {
    mockFindMany.mockReset();
  });

  it('queries active, currently-featured products ordered soonest-expiring first, limited to 3', async () => {
    mockFindMany.mockResolvedValue([]);

    await getFeaturedProducts();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          featuredUntil: { gte: expect.any(Date) },
        }),
        orderBy: { featuredUntil: 'asc' },
        take: 3,
      }),
    );
  });

  it('maps the returned rows to storefront products', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'p1',
        slug: 'bag-arabica-250g',
        category: 'coffee',
        nameVi: 'Arabica',
        nameEn: 'Arabica',
        descriptionVi: 'Mô tả',
        descriptionEn: 'Description',
        originVi: null,
        originEn: null,
        originStoryVi: null,
        originStoryEn: null,
        tastingNotesVi: [],
        tastingNotesEn: [],
        roastLevel: null,
        imageUrl: 'https://example.com/a.jpg',
        images: [],
        weightOptions: ['250g'],
        grindOptions: ['whole_bean'],
        priceVnd: 185000,
        priceUsd: null,
        stock: 10,
        reorderLevel: 5,
        roastDate: new Date('2026-08-16T00:00:00.000Z'),
        featuredUntil: new Date('2026-08-25T00:00:00.000Z'),
        isActive: true,
        createdAt: new Date('2026-08-16T00:00:00.000Z'),
        updatedAt: new Date('2026-08-16T00:00:00.000Z'),
        brewGuides: [],
      },
    ]);

    const result = await getFeaturedProducts();

    expect(result).toEqual([
      expect.objectContaining({ slug: 'bag-arabica-250g', priceVnd: 185000 }),
    ]);
  });
});
