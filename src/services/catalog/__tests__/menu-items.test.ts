import { prisma } from '@/lib/prisma';
import type { AuthUser } from '@/lib/providers/auth/types';

import { createMenuItem } from '../create-menu-item';
import { getAdminMenuItems } from '../get-admin-menu-items';
import { slugify, uniqueMenuItemSlug } from '../slugify';

jest.mock('@/lib/prisma', () => ({
  prisma: { menuItem: { findMany: jest.fn(), create: jest.fn() } },
}));

const findMany = jest.mocked(prisma.menuItem.findMany);
const create = jest.mocked(prisma.menuItem.create);

const user = (role: AuthUser['role'], homeSiteId: string | null): AuthUser => ({
  id: 'u1',
  email: 'a@b.c',
  name: 'A',
  role,
  preferredLocale: 'en',
  homeSiteId,
});

afterEach(() => jest.resetAllMocks());

describe('slugify', () => {
  it('strips accents and punctuation', () => {
    expect(slugify('  Cà phê Sữa Đá! ')).toBe('ca-phe-sua-da');
  });
});

describe('uniqueMenuItemSlug', () => {
  it('returns the base slug when free', async () => {
    findMany.mockResolvedValue([] as never);

    expect(await uniqueMenuItemSlug('s1', 'Latte')).toBe('latte');
  });

  it('suffixes past taken slugs', async () => {
    findMany.mockResolvedValue([{ slug: 'latte' }, { slug: 'latte-2' }] as never);

    expect(await uniqueMenuItemSlug('s1', 'Latte')).toBe('latte-3');
  });
});

describe('createMenuItem', () => {
  const input = {
    siteId: 's1',
    section: 'tea' as const,
    nameVi: 'Trà',
    nameEn: 'Tea',
    priceVnd: 1000,
    order: 0,
  };

  it('rejects cross-site staff before any query', async () => {
    await expect(createMenuItem(user('staff', 's2'), input)).rejects.toThrow();
    expect(findMany).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('writes the derived slug', async () => {
    findMany.mockResolvedValue([] as never);

    await createMenuItem(user('staff', 's1'), input);

    expect(create).toHaveBeenCalledWith({ data: { ...input, slug: 'tea' } });
  });
});

describe('getAdminMenuItems', () => {
  it('scopes staff to their site and admin to all', async () => {
    findMany.mockResolvedValue([] as never);

    await getAdminMenuItems(user('staff', 's1'));
    await getAdminMenuItems(user('admin', null));

    expect(findMany.mock.calls[0][0]?.where).toEqual({ siteId: 's1' });
    expect(findMany.mock.calls[1][0]?.where).toEqual({});
  });

  it('pages with a cursor and reports the next cursor when more rows exist', async () => {
    findMany.mockResolvedValue([
      { id: 'm1', site: { nameEn: 'A' } },
      { id: 'm2', site: { nameEn: 'A' } },
      { id: 'm3', site: { nameEn: 'A' } },
    ] as never);

    const page = await getAdminMenuItems(user('admin', null), { take: 2, cursor: 'm0' });

    expect(findMany.mock.calls[0][0]).toMatchObject({ take: 3, cursor: { id: 'm0' }, skip: 1 });
    expect(page.items.map((i) => i.id)).toEqual(['m1', 'm2']);
    expect(page.nextCursor).toBe('m2');
  });
});
