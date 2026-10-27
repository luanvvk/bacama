/** @jest-environment node */
import { NextRequest } from 'next/server';

import { GET } from '../route';
import { getAuthProvider } from '@/lib/providers/auth';
import { getAdminSites } from '@/services/sites/site-admin';

jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('@/services/sites/site-admin', () => ({ getAdminSites: jest.fn() }));

const getCurrentUser = jest.fn();
const getPage = jest.mocked(getAdminSites);

const get = (query = '') => GET(new NextRequest(`http://localhost/api/admin/sites${query}`));

beforeEach(() => {
  jest.mocked(getAuthProvider).mockReturnValue({ getCurrentUser } as never);
  getPage.mockResolvedValue({ items: [], nextCursor: 's9' });
});

afterEach(() => jest.resetAllMocks());

describe('GET /api/admin/sites', () => {
  it('returns 401 when signed out', async () => {
    getCurrentUser.mockResolvedValue(null);

    expect((await get()).status).toBe(401);
    expect(getPage).not.toHaveBeenCalled();
  });

  it('returns 403 for staff', async () => {
    getCurrentUser.mockResolvedValue({ id: 'u1', role: 'staff', homeSiteId: 's1' });

    expect((await get()).status).toBe(403);
    expect(getPage).not.toHaveBeenCalled();
  });

  it('passes the cursor through and returns the page for an admin', async () => {
    getCurrentUser.mockResolvedValue({ id: 'u1', role: 'admin' });

    const response = await get('?cursor=s5');

    expect(getPage).toHaveBeenCalledWith({ cursor: 's5' });
    expect(await response.json()).toEqual({ items: [], nextCursor: 's9' });
  });
});
