import { prisma } from '@/lib/prisma';

import { getAdminAnnouncements } from '../get-admin-announcements';

jest.mock('@/lib/prisma', () => ({ prisma: { announcement: { findMany: jest.fn() } } }));

const findMany = jest.mocked(prisma.announcement.findMany);

const user = (role: string, homeSiteId: string | null) => ({ id: 'u1', role, homeSiteId }) as never;

beforeEach(() => findMany.mockResolvedValue([] as never));
afterEach(() => jest.resetAllMocks());

describe('getAdminAnnouncements', () => {
  it('does not filter for admin', async () => {
    await getAdminAnnouncements(user('admin', null));

    expect(findMany.mock.calls[0][0]?.where).toEqual({});
  });

  it('limits staff to their own site plus all-sites rows', async () => {
    await getAdminAnnouncements(user('staff', 'site-1'));

    expect(findMany.mock.calls[0][0]?.where).toEqual({
      OR: [{ siteId: 'site-1' }, { siteId: null }],
    });
  });

  it('flattens the site name and strips timestamps', async () => {
    const stamps = { createdAt: new Date(), updatedAt: new Date() };
    findMany.mockResolvedValue([
      { id: 'a1', siteId: 's1', site: { nameEn: 'Main' }, ...stamps },
      { id: 'a2', siteId: null, site: null, ...stamps },
    ] as never);

    const { items } = await getAdminAnnouncements(user('admin', null));

    expect(items).toEqual([
      { id: 'a1', siteId: 's1', siteName: 'Main' },
      { id: 'a2', siteId: null, siteName: null },
    ]);
  });

  it('pages with a cursor and reports the next cursor when more rows exist', async () => {
    findMany.mockResolvedValue([
      { id: 'a1', siteId: null, site: null },
      { id: 'a2', siteId: null, site: null },
      { id: 'a3', siteId: null, site: null },
    ] as never);

    const page = await getAdminAnnouncements(user('admin', null), { take: 2, cursor: 'a0' });

    expect(findMany.mock.calls[0][0]).toMatchObject({ take: 3, cursor: { id: 'a0' }, skip: 1 });
    expect(page.items.map((a) => a.id)).toEqual(['a1', 'a2']);
    expect(page.nextCursor).toBe('a2');
  });
});
