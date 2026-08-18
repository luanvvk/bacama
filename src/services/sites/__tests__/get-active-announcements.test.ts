jest.mock('@/lib/prisma', () => ({
  prisma: { announcement: { findMany: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getActiveAnnouncements } from '../get-active-announcements';

const mockFindMany = prisma.announcement.findMany as jest.Mock;

describe('getActiveAnnouncements', () => {
  afterEach(() => {
    mockFindMany.mockReset();
  });

  it('excludes announcements that have not started or have already ended', async () => {
    mockFindMany.mockResolvedValue([]);

    await getActiveAnnouncements();

    const { where } = mockFindMany.mock.calls[0][0];
    expect(where.isActive).toBe(true);
    expect(where.startsAt.lte).toBeInstanceOf(Date);
    expect(where.AND).toEqual([{ OR: [{ endsAt: null }, { endsAt: expect.any(Object) }] }]);
  });

  it('includes site-wide announcements alongside the named site', async () => {
    mockFindMany.mockResolvedValue([]);

    await getActiveAnnouncements('ly-tu-trong');

    const { where } = mockFindMany.mock.calls[0][0];
    expect(where.AND[1]).toEqual({
      OR: [{ siteId: null }, { site: { slug: 'ly-tu-trong' } }],
    });
  });

  it('maps rows to the storefront announcement shape', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'a1',
        titleVi: 'Ưu đãi hôm nay',
        titleEn: 'Cookies discounted',
        bodyVi: 'Giảm 10%',
        bodyEn: '10% off',
        site: { slug: 'ly-tu-trong' },
      },
      {
        id: 'a2',
        titleEn: 'Site-wide',
        bodyEn: 'Applies everywhere',
        site: null,
      },
    ]);

    const result = await getActiveAnnouncements();

    expect(result).toEqual([
      { id: 'a1', title: 'Cookies discounted', body: '10% off', siteSlug: 'ly-tu-trong' },
      { id: 'a2', title: 'Site-wide', body: 'Applies everywhere', siteSlug: null },
    ]);
  });
});
