/** @jest-environment node */
import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';

import { GET, POST } from '../route';
import { getAuthProvider } from '@/lib/providers/auth';
import { prisma } from '@/lib/prisma';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    announcement: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const getCurrentUser = jest.fn();
const { findUnique, create, update, delete: remove } = jest.mocked(prisma.announcement);

const valid = (siteId: string | null = 'site-1') => ({
  siteId,
  titleVi: 'Tieu de',
  titleEn: 'Title',
  bodyVi: 'Noi dung',
  bodyEn: 'Body',
  startsAt: '2026-06-01T00:00:00+07:00',
  endsAt: '2026-06-30T00:00:00+07:00',
  isActive: true,
});

const signIn = (role: string, homeSiteId: string | null = 'site-1') =>
  getCurrentUser.mockResolvedValue({ id: 'u1', role, homeSiteId });

const expectNoWriteOrRevalidate = () => {
  expect(create).not.toHaveBeenCalled();
  expect(update).not.toHaveBeenCalled();
  expect(remove).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
};

const expectRevalidated = () => {
  expect(revalidatePath).toHaveBeenCalledWith('/');
  expect(revalidatePath).toHaveBeenCalledWith('/story');
  expect(revalidatePath).toHaveBeenCalledWith('/sites/[slug]', 'page');
};

beforeEach(() => {
  jest.mocked(getAuthProvider).mockReturnValue({ getCurrentUser } as never);
  findUnique.mockResolvedValue({ siteId: 'site-1' } as never);
  create.mockResolvedValue({ id: 'a1' } as never);
});

afterEach(() => jest.resetAllMocks());

const post = (body: unknown) =>
  POST(
    new NextRequest('http://localhost/api/admin/announcements', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

describe('POST /api/admin/announcements', () => {
  it('returns 401 for a guest', async () => {
    getCurrentUser.mockResolvedValue(null);

    expect((await post(valid())).status).toBe(401);
    expectNoWriteOrRevalidate();
  });

  it.each(['customer', 'instructor'])('returns 403 for %s', async (role) => {
    signIn(role);

    expect((await post(valid())).status).toBe(403);
    expectNoWriteOrRevalidate();
  });

  it('creates for staff on their own site and revalidates', async () => {
    signIn('staff');

    const response = await post(valid());

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: 'a1' });
    expect(create).toHaveBeenCalledTimes(1);
    expectRevalidated();
  });

  it('returns 403 for staff on another site', async () => {
    signIn('staff', 'site-2');

    expect((await post(valid('site-1'))).status).toBe(403);
    expectNoWriteOrRevalidate();
  });

  it('returns 403 for staff creating an all-sites announcement', async () => {
    signIn('staff');

    expect((await post(valid(null))).status).toBe(403);
    expectNoWriteOrRevalidate();
  });

  it.each([null, 'site-9'])('lets admin create for %s', async (siteId) => {
    signIn('admin', null);

    expect((await post(valid(siteId))).status).toBe(201);
    expectRevalidated();
  });

  const { titleVi: _t, ...noTitleVi } = valid();
  const { bodyEn: _b, ...noBodyEn } = valid();
  const { isActive: _i, ...noIsActive } = valid();

  it.each([
    ['missing titleVi', noTitleVi],
    ['missing bodyEn', noBodyEn],
    ['missing isActive', noIsActive],
    ['endsAt before startsAt', { ...valid(), endsAt: '2026-05-01T00:00:00+07:00' }],
    ['endsAt equal to startsAt', { ...valid(), endsAt: '2026-06-01T00:00:00+07:00' }],
    ['unknown key', { ...valid(), extra: 1 }],
    ['invalid JSON', '{not json'],
  ])('returns 400 for %s', async (_name, body) => {
    signIn('admin', null);

    expect((await post(body)).status).toBe(400);
    expectNoWriteOrRevalidate();
  });
});

describe('GET /api/admin/announcements', () => {
  const get = (query = '') =>
    GET(new NextRequest(`http://localhost/api/admin/announcements${query}`));

  it('returns 401 when signed out', async () => {
    getCurrentUser.mockResolvedValue(null);

    expect((await get()).status).toBe(401);
  });

  it('returns 403 for a customer', async () => {
    signIn('customer');

    expect((await get()).status).toBe(403);
  });

  it('passes the cursor to the query and returns the page', async () => {
    signIn('admin', null);
    jest.mocked(prisma.announcement.findMany).mockResolvedValue([
      { id: 'a1', siteId: null, site: null },
      { id: 'a2', siteId: null, site: null },
    ] as never);

    const response = await get('?cursor=a0');

    expect(jest.mocked(prisma.announcement.findMany).mock.calls[0][0]).toMatchObject({
      cursor: { id: 'a0' },
      skip: 1,
    });
    expect(await response.json()).toEqual({
      items: [
        { id: 'a1', siteId: null, siteName: null },
        { id: 'a2', siteId: null, siteName: null },
      ],
      nextCursor: null,
    });
  });
});
