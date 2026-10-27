/** @jest-environment node */
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

import { GET, POST } from '../route';
import { getAuthProvider } from '@/lib/providers/auth';
import { createBakeryItem, getAdminBakeryItems } from '@/services/catalog/bakery-item-admin';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('@/services/catalog/bakery-item-admin', () => ({
  createBakeryItem: jest.fn(),
  getAdminBakeryItems: jest.fn(),
}));

const getCurrentUser = jest.fn();
const create = jest.mocked(createBakeryItem);

const USER = { id: 'u1', email: 'a@b.c', name: 'A', preferredLocale: 'en', homeSiteId: 'site-1' };

const VALID = {
  siteId: 'site-1',
  nameVi: 'Bánh',
  nameEn: 'Roll',
  descriptionVi: 'mô tả',
  descriptionEn: 'desc',
  priceVnd: 45000,
  bakesAt: 'Hằng ngày',
  sellOutBy: '',
  handoff: 'pickup',
  handoffUrl: '',
  isActive: true,
};

const post = (body: unknown) =>
  POST(
    new NextRequest('http://localhost/api/admin/bakery-items', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  jest.mocked(getAuthProvider).mockReturnValue({ getCurrentUser } as never);
  create.mockResolvedValue({ id: 'b1', slug: 'roll' } as never);
});

afterEach(() => jest.resetAllMocks());

describe('GET /api/admin/bakery-items', () => {
  const list = jest.mocked(getAdminBakeryItems);
  const get = (query = '') =>
    GET(new NextRequest(`http://localhost/api/admin/bakery-items${query}`));

  it('returns 401 when signed out', async () => {
    getCurrentUser.mockResolvedValue(null);

    expect((await get()).status).toBe(401);
    expect(list).not.toHaveBeenCalled();
  });

  it('scopes staff to their home site and passes the cursor', async () => {
    getCurrentUser.mockResolvedValue({ ...USER, role: 'staff' });
    list.mockResolvedValue({ items: [], nextCursor: 'b9' });

    const response = await get('?cursor=b5');

    expect(list).toHaveBeenCalledWith({ siteId: 'site-1' }, { cursor: 'b5' });
    expect(await response.json()).toEqual({ items: [], nextCursor: 'b9' });
  });
});

describe('POST /api/admin/bakery-items', () => {
  it('returns 401 when signed out', async () => {
    getCurrentUser.mockResolvedValue(null);

    expect((await post(VALID)).status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });

  it.each(['customer', 'instructor'])('returns 403 for a %s', async (role) => {
    getCurrentUser.mockResolvedValue({ ...USER, role });

    expect((await post(VALID)).status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });

  it('lets staff create at their home site and revalidates the storefront', async () => {
    getCurrentUser.mockResolvedValue({ ...USER, role: 'staff' });

    const response = await post(VALID);

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ siteId: 'site-1', sellOutBy: null, handoffUrl: null }),
    );
    expect(revalidatePath).toHaveBeenCalledWith('/bakery');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it('returns 403 and writes nothing when staff target another site', async () => {
    getCurrentUser.mockResolvedValue({ ...USER, role: 'staff' });

    expect((await post({ ...VALID, siteId: 'site-2' })).status).toBe(403);
    expect(create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('lets admin choose any site', async () => {
    getCurrentUser.mockResolvedValue({ ...USER, role: 'admin', homeSiteId: null });

    expect((await post({ ...VALID, siteId: 'site-2' })).status).toBe(201);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ siteId: 'site-2' }));
  });

  it.each([
    ['a non-https link', { handoffUrl: 'http://example.com' }],
    ['a negative price', { priceVnd: -1 }],
    ['an empty price', { priceVnd: '' }],
    ['a missing name', { nameEn: '' }],
    ['an unknown handoff', { handoff: 'drone' }],
  ])('returns 400 for %s', async (_label, override) => {
    getCurrentUser.mockResolvedValue({ ...USER, role: 'admin' });

    expect((await post({ ...VALID, ...override })).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('returns 400 when the site does not exist', async () => {
    getCurrentUser.mockResolvedValue({ ...USER, role: 'admin' });
    create.mockRejectedValue({ code: 'P2003' });

    expect((await post(VALID)).status).toBe(400);
  });
});
