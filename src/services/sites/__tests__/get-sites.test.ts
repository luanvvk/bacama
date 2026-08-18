jest.mock('@/lib/prisma', () => ({
  prisma: { site: { findMany: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getSites } from '../get-sites';

const mockFindMany = prisma.site.findMany as jest.Mock;

describe('getSites', () => {
  afterEach(() => {
    mockFindMany.mockReset();
  });

  it('queries active sites in opening order', async () => {
    mockFindMany.mockResolvedValue([]);

    await getSites();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      }),
    );
  });

  it('maps rows through mapSite', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'site-1',
        slug: 'ly-tu-trong',
        city: 'Đà Nẵng',
        nameEn: 'Ly Tu Trong',
        addressEn: 'K154/6 Ly Tu Trong',
        hoursEn: 'Every day · 7 a.m. – 9 p.m.',
        imageUrl: null,
        opensAt: null,
        todaysRoastProduct: null,
        _count: { menuItems: 0, bakeryItems: 0 },
      },
    ]);

    const result = await getSites();

    expect(result).toEqual([
      expect.objectContaining({ slug: 'ly-tu-trong', name: 'Ly Tu Trong', comingSoon: false }),
    ]);
  });
});
