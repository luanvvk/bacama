/** @jest-environment node */
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

import { DELETE, PATCH } from '../route';
import { getAuthProvider } from '@/lib/providers/auth';
import {
  deactivateBakeryItem,
  findBakeryItemSite,
  updateBakeryItem,
} from '@/services/catalog/bakery-item-admin';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('@/services/catalog/bakery-item-admin', () => ({
  deactivateBakeryItem: jest.fn(),
  findBakeryItemSite: jest.fn(),
  updateBakeryItem: jest.fn(),
}));

const getCurrentUser = jest.fn();
const find = jest.mocked(findBakeryItemSite);
const update = jest.mocked(updateBakeryItem);
const deactivate = jest.mocked(deactivateBakeryItem);

const USER = { id: 'u1', email: 'a@b.c', name: 'A', preferredLocale: 'en', homeSiteId: 'site-1' };
const VALID = {
  siteId: 'site-1',
  nameVi: 'Bánh',
  nameEn: 'Roll',
  descriptionVi: 'mô tả',
  descriptionEn: 'desc',
  priceVnd: 50000,
  bakesAt: 'Hằng ngày',
  handoff: 'pickup',
  isActive: true,
};

const context = { params: Promise.resolve({ id: 'b1' }) };
const url = 'http://localhost/api/admin/bakery-items/b1';
const patch = (body: unknown) =>
  PATCH(new NextRequest(url, { method: 'PATCH', body: JSON.stringify(body) }), context);
const del = () => DELETE(new NextRequest(url, { method: 'DELETE' }), context);

beforeEach(() => {
  jest.mocked(getAuthProvider).mockReturnValue({ getCurrentUser } as never);
  find.mockResolvedValue({ id: 'b1', siteId: 'site-1' } as never);
});

afterEach(() => jest.resetAllMocks());

describe('PATCH /api/admin/bakery-items/[id]', () => {
  it('returns 401 when signed out', async () => {
    getCurrentUser.mockResolvedValue(null);

    expect((await patch(VALID)).status).toBe(401);
    expect(update).not.toHaveBeenCalled();
  });

  it('returns 403 for a customer', async () => {
    getCurrentUser.mockResolvedValue({ ...USER, role: 'customer' });

    expect((await patch(VALID)).status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });

  it('updates an item at the staff home site and revalidates', async () => {
    getCurrentUser.mockResolvedValue({ ...USER, role: 'staff' });

    expect((await patch(VALID)).status).toBe(200);
    expect(update).toHaveBeenCalledWith('b1', expect.objectContaining({ priceVnd: 50000 }));
    expect(revalidatePath).toHaveBeenCalledWith('/bakery');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it('returns 403 and writes nothing for an item at another site', async () => {
    getCurrentUser.mockResolvedValue({ ...USER, role: 'staff', homeSiteId: 'site-2' });

    expect((await patch(VALID)).status).toBe(403);
    expect(update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('lets admin edit an item at any site', async () => {
    getCurrentUser.mockResolvedValue({ ...USER, role: 'admin', homeSiteId: null });

    expect((await patch(VALID)).status).toBe(200);
  });

  it('returns 404 for an unknown item', async () => {
    getCurrentUser.mockResolvedValue({ ...USER, role: 'admin' });
    find.mockResolvedValue(null);

    expect((await patch(VALID)).status).toBe(404);
  });

  it('returns 400 for an invalid body', async () => {
    getCurrentUser.mockResolvedValue({ ...USER, role: 'staff' });

    expect((await patch({ ...VALID, handoffUrl: 'javascript:alert(1)' })).status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/admin/bakery-items/[id]', () => {
  it('returns 401 when signed out', async () => {
    getCurrentUser.mockResolvedValue(null);

    expect((await del()).status).toBe(401);
    expect(deactivate).not.toHaveBeenCalled();
  });

  it('returns 403 for an instructor', async () => {
    getCurrentUser.mockResolvedValue({ ...USER, role: 'instructor' });

    expect((await del()).status).toBe(403);
    expect(deactivate).not.toHaveBeenCalled();
  });

  it('deactivates an item at the staff home site and revalidates', async () => {
    getCurrentUser.mockResolvedValue({ ...USER, role: 'staff' });

    expect((await del()).status).toBe(200);
    expect(deactivate).toHaveBeenCalledWith('b1');
    expect(revalidatePath).toHaveBeenCalledWith('/bakery');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it('returns 403 and deactivates nothing for another site', async () => {
    getCurrentUser.mockResolvedValue({ ...USER, role: 'staff', homeSiteId: 'site-2' });

    expect((await del()).status).toBe(403);
    expect(deactivate).not.toHaveBeenCalled();
  });

  it('lets admin deactivate at any site', async () => {
    getCurrentUser.mockResolvedValue({ ...USER, role: 'admin', homeSiteId: null });

    expect((await del()).status).toBe(200);
  });
});
