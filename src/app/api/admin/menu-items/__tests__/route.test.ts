/** @jest-environment node */
import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';

import { POST } from '../route';
import { getAuthProvider } from '@/lib/providers/auth';
import { prisma } from '@/lib/prisma';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  prisma: { menuItem: { findMany: jest.fn(), create: jest.fn() } },
}));

const getCurrentUser = jest.fn();
const findMany = jest.mocked(prisma.menuItem.findMany);
const create = jest.mocked(prisma.menuItem.create);

const valid = {
  siteId: 'site-1',
  section: 'espresso',
  nameVi: 'Cà phê',
  nameEn: 'Coffee',
  priceVnd: 45000,
};

const post = (body: unknown) =>
  POST(
    new NextRequest('http://localhost/api/admin/menu-items', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  );

const signIn = (role: string, homeSiteId: string | null = 'site-1') =>
  getCurrentUser.mockResolvedValue({ id: 'u1', role, homeSiteId });

beforeEach(() => {
  jest.mocked(getAuthProvider).mockReturnValue({ getCurrentUser } as never);
  findMany.mockResolvedValue([] as never);
  create.mockResolvedValue({ id: 'm1', slug: 'coffee' } as never);
});

afterEach(() => jest.resetAllMocks());

describe('POST /api/admin/menu-items', () => {
  it('returns 401 for a guest', async () => {
    getCurrentUser.mockResolvedValue(null);

    expect((await post(valid)).status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });

  it.each(['customer', 'instructor'])('returns 403 for %s', async (role) => {
    signIn(role);

    expect((await post(valid)).status).toBe(403);
    expect(create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('creates for staff on their own site and revalidates /menu', async () => {
    signIn('staff');

    const response = await post(valid);

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith({
      data: { ...valid, order: 0, slug: 'coffee' },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/menu');
  });

  it('returns 403 and writes nothing for staff on another site', async () => {
    signIn('staff', 'site-2');

    expect((await post(valid)).status).toBe(403);
    expect(findMany).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('lets admin create on any site', async () => {
    signIn('admin', null);

    expect((await post(valid)).status).toBe(201);
  });

  it('returns 400 for an unknown section', async () => {
    signIn('admin', null);

    expect((await post({ ...valid, section: 'soup' })).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns 400 for a client-supplied slug', async () => {
    signIn('admin', null);

    expect((await post({ ...valid, slug: 'x' })).status).toBe(400);
  });

  it('returns 409 on a slug collision', async () => {
    signIn('admin', null);
    create.mockRejectedValue({ code: 'P2002' });

    expect((await post(valid)).status).toBe(409);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
