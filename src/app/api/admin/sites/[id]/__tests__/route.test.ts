/** @jest-environment node */
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

import { PATCH } from '../route';
import { getAuthProvider } from '@/lib/providers/auth';
import { findSiteForUpdate, isActiveProduct, updateSite } from '@/services/sites/site-admin';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('@/services/sites/site-admin', () => ({
  findSiteForUpdate: jest.fn(),
  isActiveProduct: jest.fn(),
  updateSite: jest.fn(),
}));

const getCurrentUser = jest.fn();
const find = jest.mocked(findSiteForUpdate);
const productActive = jest.mocked(isActiveProduct);
const update = jest.mocked(updateSite);

const USER = { id: 'u1', email: 'a@b.c', name: 'A', preferredLocale: 'en', homeSiteId: 'site-1' };
const VALID = {
  nameVi: 'Ngô Quyền',
  nameEn: 'Ngo Quyen',
  addressVi: '27 Ngô Quyền',
  addressEn: '27 Ngo Quyen',
  hoursVi: 'Hằng ngày',
  hoursEn: 'Every day',
  isActive: true,
  todaysRoastProductId: 'p1',
};

const context = { params: Promise.resolve({ id: 'site-1' }) };
const patch = (body: unknown) =>
  PATCH(
    new NextRequest('http://localhost/api/admin/sites/site-1', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
    context,
  );

beforeEach(() => {
  jest.mocked(getAuthProvider).mockReturnValue({ getCurrentUser } as never);
  find.mockResolvedValue({ id: 'site-1', slug: 'ngo-quyen' });
  productActive.mockResolvedValue(true);
  getCurrentUser.mockResolvedValue({ ...USER, role: 'admin', homeSiteId: null });
});

afterEach(() => jest.resetAllMocks());

describe('PATCH /api/admin/sites/[id]', () => {
  it('returns 401 when signed out', async () => {
    getCurrentUser.mockResolvedValue(null);

    expect((await patch(VALID)).status).toBe(401);
    expect(update).not.toHaveBeenCalled();
  });

  it.each(['customer', 'instructor', 'staff'])(
    'returns 403 for %s, even at their own site',
    async (role) => {
      getCurrentUser.mockResolvedValue({ ...USER, role });

      expect((await patch(VALID)).status).toBe(403);
      expect(update).not.toHaveBeenCalled();
    },
  );

  it('updates the site and revalidates the storefront pages', async () => {
    expect((await patch(VALID)).status).toBe(200);
    expect(update).toHaveBeenCalledWith('site-1', VALID);
    expect(revalidatePath).toHaveBeenCalledWith('/sites/ngo-quyen');
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(revalidatePath).toHaveBeenCalledWith('/menu');
  });

  it('accepts a null roast without checking products', async () => {
    expect((await patch({ ...VALID, todaysRoastProductId: null })).status).toBe(200);
    expect(productActive).not.toHaveBeenCalled();
  });

  it('returns 400 for a roast product that does not exist or is inactive', async () => {
    productActive.mockResolvedValue(false);

    expect((await patch(VALID)).status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it.each(['slug', 'timezone', 'opensAt', 'imageUrl'])(
    'returns 400 when %s is sent',
    async (key) => {
      expect((await patch({ ...VALID, [key]: 'x' })).status).toBe(400);
      expect(update).not.toHaveBeenCalled();
    },
  );

  it('returns 400 for an empty name', async () => {
    expect((await patch({ ...VALID, nameEn: ' ' })).status).toBe(400);
  });

  it('returns 404 for an unknown site', async () => {
    find.mockResolvedValue(null);

    expect((await patch(VALID)).status).toBe(404);
    expect(update).not.toHaveBeenCalled();
  });
});
