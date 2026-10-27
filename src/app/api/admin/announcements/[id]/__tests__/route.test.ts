/** @jest-environment node */
import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';

import { DELETE, PATCH } from '../route';
import { getAuthProvider } from '@/lib/providers/auth';
import { prisma } from '@/lib/prisma';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    announcement: {
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
  update.mockResolvedValue({ id: 'a1' } as never);
  remove.mockResolvedValue({ id: 'a1' } as never);
});

afterEach(() => jest.resetAllMocks());

const context = { params: Promise.resolve({ id: 'a1' }) };
const request = (method: string, body?: unknown) =>
  new NextRequest('http://localhost/api/admin/announcements/a1', {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const patch = (body: unknown = valid()) => PATCH(request('PATCH', body), context);
const del = () => DELETE(request('DELETE'), context);

describe.each([
  ['PATCH', () => patch()],
  ['DELETE', () => del()],
])('%s /api/admin/announcements/[id]', (_method, call) => {
  it('returns 401 for a guest', async () => {
    getCurrentUser.mockResolvedValue(null);

    expect((await call()).status).toBe(401);
    expectNoWriteOrRevalidate();
  });

  it.each(['customer', 'instructor'])('returns 403 for %s', async (role) => {
    signIn(role);

    expect((await call()).status).toBe(403);
    expectNoWriteOrRevalidate();
  });

  it('succeeds for staff on their own site and revalidates', async () => {
    signIn('staff');

    expect((await call()).status).toBe(200);
    expectRevalidated();
  });

  it('returns 403 for staff when the row is on another site', async () => {
    signIn('staff', 'site-2');

    expect((await call()).status).toBe(403);
    expectNoWriteOrRevalidate();
  });

  it('returns 403 for staff on an all-sites row', async () => {
    signIn('staff');
    findUnique.mockResolvedValue({ siteId: null } as never);

    expect((await call()).status).toBe(403);
    expectNoWriteOrRevalidate();
  });

  it('lets admin act on an all-sites row', async () => {
    signIn('admin', null);
    findUnique.mockResolvedValue({ siteId: null } as never);

    expect((await call()).status).toBe(200);
    expectRevalidated();
  });

  it('lets admin act on any site', async () => {
    signIn('admin', null);
    findUnique.mockResolvedValue({ siteId: 'site-9' } as never);

    expect((await call()).status).toBe(200);
  });

  it('returns 404 for an unknown id', async () => {
    signIn('admin', null);
    findUnique.mockResolvedValue(null);

    expect((await call()).status).toBe(404);
    expectNoWriteOrRevalidate();
  });
});

describe('PATCH specifics', () => {
  it('returns 403 when staff move their row to all sites', async () => {
    signIn('staff');

    expect((await patch(valid(null))).status).toBe(403);
    expectNoWriteOrRevalidate();
  });

  it('returns 403 when staff move their row to another site', async () => {
    signIn('staff');

    expect((await patch(valid('site-2'))).status).toBe(403);
    expectNoWriteOrRevalidate();
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
  ])('returns 400 for %s', async (_name, body) => {
    signIn('admin', null);

    expect((await patch(body)).status).toBe(400);
    expectNoWriteOrRevalidate();
  });
});
