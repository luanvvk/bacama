jest.mock('@/lib/prisma', () => ({
  prisma: { product: { findMany: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getProducts } from '../get-products';

const mockFindMany = prisma.product.findMany as jest.Mock;

describe('getProducts', () => {
  afterEach(() => {
    mockFindMany.mockReset();
  });

  it('queries active products, newest first', async () => {
    mockFindMany.mockResolvedValue([]);

    await getProducts('en');

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
    );
  });

  it('ranks only unexpired featured products first, keeping newest-first otherwise', async () => {
    const row = (slug: string, featuredUntil: Date | null) => ({
      id: slug,
      slug,
      category: 'coffee',
      nameVi: slug,
      nameEn: slug,
      descriptionVi: '',
      descriptionEn: '',
      originVi: null,
      originEn: null,
      originStoryVi: null,
      originStoryEn: null,
      tastingNotesVi: [],
      tastingNotesEn: [],
      roastLevel: null,
      imageUrl: 'https://example.com/r.jpg',
      images: [],
      weightOptions: [],
      grindOptions: [],
      priceVnd: 1000,
      priceUsd: null,
      stock: 1,
      reorderLevel: 1,
      roastDate: null,
      featuredUntil,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      brewGuides: [],
    });
    const day = 86_400_000;
    mockFindMany.mockResolvedValue([
      row('null-new', null),
      row('expired', new Date(Date.now() - day)),
      row('active', new Date(Date.now() + day)),
      row('null-old', null),
    ]);

    const result = await getProducts('en');

    expect(result.map((p) => p.slug)).toEqual(['active', 'null-new', 'expired', 'null-old']);
  });

  it('maps every returned row to the storefront product shape', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'p1',
        slug: 'bag-robusta-250g',
        category: 'coffee',
        nameVi: 'Robusta',
        nameEn: 'Robusta',
        descriptionVi: 'Mô tả',
        descriptionEn: 'Description',
        originVi: null,
        originEn: null,
        originStoryVi: null,
        originStoryEn: null,
        tastingNotesVi: [],
        tastingNotesEn: [],
        roastLevel: null,
        imageUrl: 'https://example.com/r.jpg',
        images: [],
        weightOptions: ['250g'],
        grindOptions: ['whole_bean'],
        priceVnd: 145000,
        priceUsd: null,
        stock: 10,
        reorderLevel: 5,
        roastDate: new Date('2026-08-16T00:00:00.000Z'),
        featuredUntil: null,
        isActive: true,
        createdAt: new Date('2026-08-16T00:00:00.000Z'),
        updatedAt: new Date('2026-08-16T00:00:00.000Z'),
        brewGuides: [],
      },
    ]);

    const result = await getProducts('en');

    expect(result).toEqual([
      expect.objectContaining({ slug: 'bag-robusta-250g', priceVnd: 145000 }),
    ]);
  });
});
