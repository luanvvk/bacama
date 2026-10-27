/** @jest-environment node */
import { NextRequest } from 'next/server';

import { GET } from '../route';
import { getAuthProvider } from '@/lib/providers/auth';
import { getAdminProductsPage } from '@/services/catalog/get-admin-products';

jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('@/services/catalog/get-admin-products', () => ({ getAdminProductsPage: jest.fn() }));

const getCurrentUser = jest.fn();
const getPage = jest.mocked(getAdminProductsPage);

const get = (query = '') => GET(new NextRequest(`http://localhost/api/admin/products${query}`));

beforeEach(() => {
  jest.mocked(getAuthProvider).mockReturnValue({ getCurrentUser } as never);
  getPage.mockResolvedValue({ items: [], nextCursor: 'p9' });
});

afterEach(() => jest.resetAllMocks());

describe('GET /api/admin/products', () => {
  it('returns 401 when signed out', async () => {
    getCurrentUser.mockResolvedValue(null);

    expect((await get()).status).toBe(401);
    expect(getPage).not.toHaveBeenCalled();
  });

  it('returns 403 for a customer', async () => {
    getCurrentUser.mockResolvedValue({ id: 'u1', role: 'customer' });

    expect((await get()).status).toBe(403);
  });

  it('passes the cursor through and returns the page', async () => {
    getCurrentUser.mockResolvedValue({ id: 'u1', role: 'staff', homeSiteId: 's1' });

    const response = await get('?cursor=p5');

    expect(getPage).toHaveBeenCalledWith({ cursor: 'p5' });
    expect(await response.json()).toEqual({ items: [], nextCursor: 'p9' });
  });
});
