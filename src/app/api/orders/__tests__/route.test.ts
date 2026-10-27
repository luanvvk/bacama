/** @jest-environment node */
import { NextRequest } from 'next/server';

import { POST } from '../route';
import { getAuthProvider } from '@/lib/providers/auth';
import { createOrder } from '@/services/orders/create-order';

jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
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
      { ...VALID, items: [{ id: 'p1', quantity: 100 }] },
      { ...VALID, items: Array.from({ length: 51 }, () => ({ id: 'p1', quantity: 1 })) },
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
