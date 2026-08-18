jest.mock('@/lib/prisma', () => ({
  prisma: { site: { findFirst: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getSiteBySlug } from '../get-site-by-slug';

const mockFindFirst = prisma.site.findFirst as jest.Mock;

describe('getSiteBySlug', () => {
  afterEach(() => {
    mockFindFirst.mockReset();
  });

  it('queries the slug scoped to active sites', async () => {
    mockFindFirst.mockResolvedValue(null);

    await getSiteBySlug('ly-tu-trong');

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'ly-tu-trong', isActive: true } }),
    );
  });

  it('returns null when no site matches', async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(getSiteBySlug('nope')).resolves.toBeNull();
  });

  it('maps a found row to the storefront site shape', async () => {
    mockFindFirst.mockResolvedValue({
      id: 'site-1',
      slug: 'ly-tu-trong',
      city: 'Đà Nẵng',
      nameEn: 'Ly Tu Trong',
      addressEn: 'K154/6 Ly Tu Trong',
      hoursEn: 'Every day · 7 a.m. – 9 p.m.',
      imageUrl: null,
      opensAt: null,
      todaysRoastProduct: { slug: 'bag-arabica-250g', nameEn: 'Arabica 250g' },
      _count: { menuItems: 26, bakeryItems: 48 },
    });

    const result = await getSiteBySlug('ly-tu-trong');

    expect(result).toEqual(
      expect.objectContaining({
        slug: 'ly-tu-trong',
        todaysRoast: { slug: 'bag-arabica-250g', name: 'Arabica 250g' },
      }),
    );
  });
});
