/** @jest-environment node */
import { NextRequest } from 'next/server';

import { POST } from '../route';
import { hitRateLimit } from '@/lib/rate-limit';
import { getAuthProvider } from '@/lib/providers/auth';
import { createOrder } from '@/services/orders/create-order';

jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/lib/rate-limit', () => ({ hitRateLimit: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('@/services/orders/create-order', () => ({
  ...jest.requireActual('@/services/orders/create-order'),
  createOrder: jest.fn(),
}));

const getCurrentUser = jest.fn();
const create = jest.mocked(createOrder);

const VALID = {
  items: [{ id: 'p1', quantity: 1 }],
  customerName: 'Test Buyer',
  phone: '0905999888',
  email: 'test@example.com',
  paymentMethod: 'cod',
  deliveryOption: 'ghn',
  locale: 'vi',
};

const post = (body: unknown) =>
  POST(
    new NextRequest('http://localhost/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  );

beforeAll(() => {
  process.env.CLERK_SECRET_KEY = 'test-secret';
});

beforeEach(() => {
  jest.mocked(getAuthProvider).mockReturnValue({ getCurrentUser } as never);
  create.mockResolvedValue({ id: 'o1', ref: 'BCM-1' });
  jest.mocked(hitRateLimit).mockResolvedValue({ allowed: true, hitId: 'h' });
});

afterEach(() => jest.clearAllMocks());

describe('POST /api/orders userId', () => {
  it('attaches the session user id', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1' });
    await post(VALID);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1' }));
  });

  it('stores guest orders with a null userId', async () => {
    getCurrentUser.mockResolvedValue(null);
    await post(VALID);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ userId: null }));
  });

  it('ignores a userId supplied in the body', async () => {
    getCurrentUser.mockResolvedValue(null);
    await post({ ...VALID, userId: 'someone-else' });
    getCurrentUser.mockResolvedValue({ id: 'user-1' });
    await post({ ...VALID, userId: 'someone-else' });
    expect(create.mock.calls.map(([input]) => input.userId)).toEqual([null, 'user-1']);
  });
});

describe('POST /api/orders body bounds', () => {
  it('returns 400 for a malformed JSON body', async () => {
    const res = await POST(
      new NextRequest('http://localhost/api/orders', { method: 'POST', body: '{nope' }),
    );
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects oversize quantity, item count and note', async () => {
    const big = [
      { ...VALID, items: [{ id: 'p1', quantity: 21 }] },
      { ...VALID, items: Array.from({ length: 21 }, () => ({ id: 'p1', quantity: 1 })) },
      { ...VALID, note: 'x'.repeat(1001) },
    ];
    for (const body of big) expect((await post(body)).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
});

describe('POST /api/orders access cookie', () => {
  it('sets an httpOnly signed cookie scoped to the order ref', async () => {
    getCurrentUser.mockResolvedValue(null);
    const response = await post(VALID);
    const cookie = response.cookies.get('bcm_oa_BCM-1');
    expect(cookie).toMatchObject({ httpOnly: true, path: '/checkout' });
    expect(cookie?.value).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('POST /api/orders rate limit', () => {
  it('returns 429 with Retry-After and creates nothing when a limit is hit', async () => {
    jest
      .mocked(hitRateLimit)
      .mockResolvedValueOnce({ allowed: true, hitId: 'a' })
      .mockResolvedValueOnce({ allowed: false, hitId: 'b', retryAfterSeconds: 120 });
    const res = await post(VALID);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('120');
    expect(create).not.toHaveBeenCalled();
  });

  it('limits per IP and per normalised phone', async () => {
    await POST(
      new NextRequest('http://localhost/api/orders', {
        method: 'POST',
        headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
        body: JSON.stringify({ ...VALID, phone: '0905 999 888' }),
      }),
    );
    const keys = jest.mocked(hitRateLimit).mock.calls.map(([key]) => key);
    expect(keys).toEqual(['order:ip:1.2.3.4', 'order:phone:0905999888']);
  });
});
