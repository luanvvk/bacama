jest.mock('@/lib/prisma', () => ({
  prisma: { product: { findFirst: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getProductBySlug } from '../get-product-by-slug';

const mockFindFirst = prisma.product.findFirst as jest.Mock;

describe('getProductBySlug', () => {
  afterEach(() => {
    mockFindFirst.mockReset();
  });

  it('queries by slug, scoped to active products', async () => {
    mockFindFirst.mockResolvedValue(null);

    await getProductBySlug('bag-arabica-250g');

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'bag-arabica-250g', isActive: true } }),
    );
  });

  it('returns null when no matching product exists', async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await getProductBySlug('does-not-exist');

    expect(result).toBeNull();
  });

  it('maps a found row to the storefront product shape', async () => {
    mockFindFirst.mockResolvedValue({
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
      featuredUntil: null,
      isActive: true,
      createdAt: new Date('2026-08-16T00:00:00.000Z'),
      updatedAt: new Date('2026-08-16T00:00:00.000Z'),
      brewGuides: [],
    });

    const result = await getProductBySlug('bag-arabica-250g');

    expect(result).toEqual(expect.objectContaining({ slug: 'bag-arabica-250g', priceVnd: 185000 }));
  });
});
