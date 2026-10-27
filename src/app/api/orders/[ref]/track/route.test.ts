/** @jest-environment node */
import { NextRequest } from 'next/server';

import { hitRateLimit, releaseRateLimitHit } from '@/lib/rate-limit';
import { getOrderForTracking } from '@/services/orders/get-order-for-tracking';

import { POST } from './route';

jest.mock('@/services/orders/get-order-for-tracking', () => ({
  getOrderForTracking: jest.fn(),
}));
jest.mock('@/lib/rate-limit', () => ({
  hitRateLimit: jest.fn(),
  releaseRateLimitHit: jest.fn(),
}));

const call = (body: string, ref = 'BCM-1') =>
  POST(
    new NextRequest(`http://localhost/api/orders/${ref}/track`, {
      method: 'POST',
      body,
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    }),
    { params: Promise.resolve({ ref }) },
  );

const goodBody = JSON.stringify({ phone: '0901234567' });

describe('POST /api/orders/[ref]/track', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (hitRateLimit as jest.Mock).mockImplementation(async (key: string) => ({
      allowed: true,
      hitId: `hit:${key}`,
    }));
  });

  it('returns 400 for a malformed JSON body', async () => {
    expect((await call('{nope')).status).toBe(400);
  });

  it('returns 400 when the phone is missing or too short', async () => {
    expect((await call('{}')).status).toBe(400);
    expect((await call(JSON.stringify({ phone: '123' }))).status).toBe(400);
    expect(getOrderForTracking).not.toHaveBeenCalled();
  });

  it('returns 400 for an oversized ref without counting it', async () => {
    expect((await call(goodBody, 'B'.repeat(41))).status).toBe(400);
    expect(hitRateLimit).not.toHaveBeenCalled();
  });

  it('returns the order and releases its hits on a correct match', async () => {
    (getOrderForTracking as jest.Mock).mockResolvedValue({ ref: 'BCM-1' });
    const res = await call(goodBody);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ref: 'BCM-1' });
    expect(releaseRateLimitHit).toHaveBeenCalledWith([
      'hit:track:ref:BCM-1',
      'hit:track:ip:1.2.3.4',
    ]);
  });

  it('gives a wrong phone and an unknown ref the same 404 and keeps both hits counted', async () => {
    (getOrderForTracking as jest.Mock).mockResolvedValue(null);
    const wrongPhone = await call(goodBody, 'BCM-REAL');
    const unknownRef = await call(goodBody, 'BCM-NOPE');
    expect(wrongPhone.status).toBe(404);
    expect(unknownRef.status).toBe(404);
    expect(await wrongPhone.json()).toEqual(await unknownRef.json());
    expect(hitRateLimit).toHaveBeenCalledWith('track:ref:BCM-REAL', expect.anything());
    expect(hitRateLimit).toHaveBeenCalledWith('track:ip:1.2.3.4', expect.anything());
    expect(releaseRateLimitHit).not.toHaveBeenCalled();
  });

  it('counts the attempt before the lookup so parallel guesses cannot skip the limit', async () => {
    const order: string[] = [];
    (hitRateLimit as jest.Mock).mockImplementation(async (key: string) => {
      order.push('hit');
      return { allowed: true, hitId: key };
    });
    (getOrderForTracking as jest.Mock).mockImplementation(async () => {
      order.push('lookup');
      return null;
    });
    await call(goodBody);
    expect(order).toEqual(['hit', 'hit', 'lookup']);
  });

  it('returns 429 with Retry-After without looking the order up once the ref is locked', async () => {
    (hitRateLimit as jest.Mock).mockImplementation(async (key: string) =>
      key.startsWith('track:ref:')
        ? { allowed: false, hitId: 'r', retryAfterSeconds: 120 }
        : { allowed: true, hitId: 'i' },
    );
    const res = await call(goodBody);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('120');
    expect(getOrderForTracking).not.toHaveBeenCalled();
  });

  it('returns 429 when the IP is locked', async () => {
    (hitRateLimit as jest.Mock).mockImplementation(async (key: string) =>
      key.startsWith('track:ip:')
        ? { allowed: false, hitId: 'i', retryAfterSeconds: 30 }
        : { allowed: true, hitId: 'r' },
    );
    const res = await call(goodBody);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
  });
});
