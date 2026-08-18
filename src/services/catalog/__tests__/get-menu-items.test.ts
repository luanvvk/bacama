jest.mock('@/lib/prisma', () => ({
  prisma: { menuItem: { findMany: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getMenuItems } from '../get-menu-items';

const mockFindMany = prisma.menuItem.findMany as jest.Mock;

describe('getMenuItems', () => {
  afterEach(() => {
    mockFindMany.mockReset();
  });

  it('queries active items at active sites, ordered by section then position', async () => {
    mockFindMany.mockResolvedValue([]);

    await getMenuItems();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, site: { isActive: true } },
        orderBy: [{ section: 'asc' }, { order: 'asc' }],
      }),
    );
  });

  it('maps a found row to the storefront menu shape', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'm1',
        siteId: 'site-1',
        slug: 'espresso',
        section: 'espresso',
        nameVi: 'Espresso',
        nameEn: 'Espresso',
        priceVnd: 45000,
        order: 0,
        isActive: true,
        createdAt: new Date('2026-08-16T00:00:00.000Z'),
        updatedAt: new Date('2026-08-16T00:00:00.000Z'),
      },
    ]);

    const result = await getMenuItems();

    expect(result).toEqual([
      { id: 'm1', slug: 'espresso', section: 'espresso', name: 'Espresso', priceVnd: 45000 },
    ]);
  });
});
