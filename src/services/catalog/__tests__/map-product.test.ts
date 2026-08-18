import { mapProduct } from '../map-product';

describe('mapProduct', () => {
  it('maps a database product to the storefront product shape', () => {
    const product = {
      id: 'product-1',
      slug: 'arabica-250g',
      category: 'coffee' as const,
      nameVi: 'Arabica 250g',
      nameEn: 'Arabica 250g',
      descriptionVi: 'Mô tả',
      descriptionEn: 'Description',
      originVi: 'Đà Lạt',
      originEn: 'Da Lat',
      originStoryVi: null,
      originStoryEn: 'A coffee story',
      tastingNotesVi: ['Mật ong'],
      tastingNotesEn: ['Honey'],
      roastLevel: 'medium' as const,
      imageUrl: 'https://example.com/coffee.jpg',
      images: ['https://example.com/coffee.jpg'],
      weightOptions: ['250g'],
      grindOptions: ['whole_bean'],
      priceVnd: 200000,
      priceUsd: null,
      stock: 4,
      reorderLevel: 2,
      roastDate: new Date('2026-08-16T00:00:00.000Z'),
      featuredUntil: null,
      isActive: true,
      createdAt: new Date('2026-08-16T00:00:00.000Z'),
      updatedAt: new Date('2026-08-16T00:00:00.000Z'),
      brewGuides: [
        {
          id: 'guide-1',
          productId: 'product-1',
          method: 'Phin',
          ratio: '25 g · 120 ml',
          detailVi: 'Chi tiết',
          detailEn: 'Medium-coarse',
          order: 0,
        },
      ],
    } satisfies Parameters<typeof mapProduct>[0];

    expect(mapProduct(product)).toMatchObject({
      id: 'product-1',
      name: 'Arabica 250g',
      category: 'coffee',
      origin: 'Da Lat',
      priceVnd: 200000,
      description: 'Description',
      soldOut: false,
      swatches: ['250g', 'whole_bean'],
      tastingNotes: ['Honey'],
      brewGuide: [{ method: 'Phin', ratio: '25 g · 120 ml', detail: 'Medium-coarse' }],
      originStory: 'A coffee story',
    });
  });
});
