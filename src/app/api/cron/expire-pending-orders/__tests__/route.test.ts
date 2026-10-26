/** @jest-environment node */
jest.mock('@/lib/prisma', () => ({
  prisma: { order: { updateMany: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { GET } from '../route';

const mockUpdateMany = prisma.order.updateMany as jest.Mock;

const call = (authorization?: string) =>
  GET(
    new Request('http://localhost/api/cron/expire-pending-orders', {
      headers: authorization ? { authorization } : {},
    }),
  );

const original = process.env.CRON_SECRET;

beforeEach(() => {
  jest.resetAllMocks();
  process.env.CRON_SECRET = 's3cret';
});

afterAll(() => {
  if (original === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = original;
});

describe('GET /api/cron/expire-pending-orders', () => {
  it('returns 401 with no database call when the header is missing', async () => {
    expect((await call()).status).toBe(401);
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it('returns 401 with no database call when the secret is wrong', async () => {
    expect((await call('Bearer nope')).status).toBe(401);
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it('returns 401 with no database call when CRON_SECRET is unset', async () => {
    delete process.env.CRON_SECRET;
    expect((await call('Bearer undefined')).status).toBe(401);
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it('runs the sweep with the right secret', async () => {
    mockUpdateMany.mockResolvedValue({ count: 2 });
    const res = await call('Bearer s3cret');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ expired: 2 });
  });
});
