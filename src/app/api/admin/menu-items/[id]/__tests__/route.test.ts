/** @jest-environment node */
import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';

import { DELETE, PATCH } from '../route';
import { getAuthProvider } from '@/lib/providers/auth';
import { prisma } from '@/lib/prisma';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  prisma: { menuItem: { findUnique: jest.fn(), update: jest.fn() } },
}));

const getCurrentUser = jest.fn();
const findUnique = jest.mocked(prisma.menuItem.findUnique);
const update = jest.mocked(prisma.menuItem.update);

const context = { params: Promise.resolve({ id: 'm1' }) };
const request = (method: string, body?: unknown) =>
  new NextRequest('http://localhost/api/admin/menu-items/m1', {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const patch = (body: unknown) => PATCH(request('PATCH', body), context);
const del = () => DELETE(request('DELETE'), context);

const signIn = (role: string, homeSiteId: string | null = 'site-1') =>
  getCurrentUser.mockResolvedValue({ id: 'u1', role, homeSiteId });

beforeEach(() => {
  jest.mocked(getAuthProvider).mockReturnValue({ getCurrentUser } as never);
  findUnique.mockResolvedValue({ siteId: 'site-1' } as never);
  update.mockResolvedValue({ id: 'm1' } as never);
});

afterEach(() => jest.resetAllMocks());

describe.each([
  ['PATCH', () => patch({ priceVnd: 50000 })],
  ['DELETE', () => del()],
])('%s /api/admin/menu-items/[id]', (_method, call) => {
  it('returns 401 for a guest', async () => {
    getCurrentUser.mockResolvedValue(null);

    expect((await call()).status).toBe(401);
    expect(update).not.toHaveBeenCalled();
  });

  it.each(['customer', 'instructor'])('returns 403 for %s', async (role) => {
    signIn(role);

    expect((await call()).status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });

  it('succeeds for staff on their own site and revalidates /menu', async () => {
    signIn('staff');

    expect((await call()).status).toBe(200);
    expect(update).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith('/menu');
  });

  it('returns 403 and writes nothing for staff on another site', async () => {
    signIn('staff', 'site-2');

    expect((await call()).status).toBe(403);
    expect(update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('lets admin act on any site', async () => {
    signIn('admin', null);

    expect((await call()).status).toBe(200);
  });

  it('returns 404 for a missing item', async () => {
    signIn('admin', null);
    findUnique.mockResolvedValue(null);

    expect((await call()).status).toBe(404);
    expect(update).not.toHaveBeenCalled();
  });
});

describe('PATCH specifics', () => {
  it.each([{ slug: 'x' }, { siteId: 'site-2' }, { section: 'soup' }, {}])(
    'returns 400 for %j',
    async (body) => {
      signIn('admin', null);

      expect((await patch(body)).status).toBe(400);
      expect(update).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    },
  );
});

describe('DELETE specifics', () => {
  it('soft-deactivates instead of deleting', async () => {
    signIn('admin', null);

    await del();

    expect(update).toHaveBeenCalledWith({ where: { id: 'm1' }, data: { isActive: false } });
  });
});
