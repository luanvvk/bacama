jest.mock('@/lib/prisma', () => ({
  prisma: { bakeryItem: { findMany: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getBakeryItems } from '../get-bakery-items';

const mockFindMany = prisma.bakeryItem.findMany as jest.Mock;

describe('getBakeryItems', () => {
  afterEach(() => {
    mockFindMany.mockReset();
  });

  it('queries active items at active sites, ordered by bake time', async () => {
    mockFindMany.mockResolvedValue([]);

    await getBakeryItems();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, site: { isActive: true } },
        orderBy: [{ bakesAt: 'asc' }, { createdAt: 'asc' }],
      }),
    );
  });

  it('maps a found row to the storefront bakery catalog shape', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'b1',
        slug: 'sunshine-croissant',
        siteId: 'site-1',
        site: { slug: 'ly-tu-trong' },
        nameVi: 'Sunshine Croissant',
        nameEn: 'Sunshine Croissant (Salted Egg)',
        descriptionVi: 'Mô tả',
        descriptionEn: 'Description',
        imageUrl: 'https://example.com/croissant.jpg',
        priceVnd: 75000,
        bakesAt: 'Hằng ngày',
        sellOutBy: null,
        handoff: 'grabfood',
        handoffUrl: null,
      },
    ]);

    const result = await getBakeryItems();

    expect(result).toEqual([
      expect.objectContaining({
        slug: 'sunshine-croissant',
        siteSlug: 'ly-tu-trong',
        name: 'Sunshine Croissant (Salted Egg)',
        priceVnd: 75000,
      }),
    ]);
  });
});
