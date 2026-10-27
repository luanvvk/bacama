import { prisma } from '@/lib/prisma';

import { getAdminSites } from '../site-admin';

jest.mock('@/lib/prisma', () => ({ prisma: { site: { findMany: jest.fn() } } }));

const findMany = jest.mocked(prisma.site.findMany);

afterEach(() => jest.resetAllMocks());

describe('getAdminSites', () => {
  it('returns every row and no cursor when the page is not full', async () => {
    findMany.mockResolvedValue([{ id: 's1' }, { id: 's2' }] as never);

    expect(await getAdminSites()).toEqual({
      items: [{ id: 's1' }, { id: 's2' }],
      nextCursor: null,
    });
    expect(findMany.mock.calls[0][0]).toMatchObject({ take: 51 });
  });

  it('pages with a cursor and reports the next cursor when more rows exist', async () => {
    findMany.mockResolvedValue([{ id: 's1' }, { id: 's2' }, { id: 's3' }] as never);

    const page = await getAdminSites({ take: 2, cursor: 's0' });

    expect(findMany.mock.calls[0][0]).toMatchObject({ take: 3, cursor: { id: 's0' }, skip: 1 });
    expect(page.items.map((s) => s.id)).toEqual(['s1', 's2']);
    expect(page.nextCursor).toBe('s2');
  });
});
