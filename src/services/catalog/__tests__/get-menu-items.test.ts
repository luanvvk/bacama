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

    await getMenuItems('en');

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
        imageUrl: 'https://images.unsplash.com/photo-1',
        descriptionVi: 'Mô tả',
        descriptionEn: 'Bold.',
        order: 0,
        isActive: true,
        createdAt: new Date('2026-08-16T00:00:00.000Z'),
        updatedAt: new Date('2026-08-16T00:00:00.000Z'),
      },
    ]);

    const result = await getMenuItems('en');

    expect(result).toEqual([
      {
        id: 'm1',
        slug: 'espresso',
        section: 'espresso',
        name: 'Espresso',
        description: 'Bold.',
        imageUrl: 'https://images.unsplash.com/photo-1',
        priceVnd: 45000,
      },
    ]);
  });

  it('returns Vi fields for vi and falls back to En when Vi is empty', async () => {
    const row = {
      id: 'm1',
      slug: 'espresso',
      section: 'espresso',
      nameVi: 'Cà phê espresso',
      nameEn: 'Espresso',
      priceVnd: 45000,
      imageUrl: null,
      descriptionVi: '',
      descriptionEn: 'Bold.',
    };
    mockFindMany.mockResolvedValue([row]);

    const [item] = await getMenuItems('vi');

    expect(item.name).toBe('Cà phê espresso');
    expect(item.description).toBe('Bold.');
  });
});
