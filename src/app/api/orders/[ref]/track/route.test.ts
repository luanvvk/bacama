/** @jest-environment node */
import { NextRequest } from 'next/server';

import { checkRateLimit, recordRateLimitHit } from '@/lib/rate-limit';
import { getOrderForTracking } from '@/services/orders/get-order-for-tracking';

import { POST } from './route';

jest.mock('@/services/orders/get-order-for-tracking', () => ({
  getOrderForTracking: jest.fn(),
}));
jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  recordRateLimitHit: jest.fn(),
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
    (checkRateLimit as jest.Mock).mockResolvedValue({ allowed: true });
  });

  it('returns 400 for a malformed JSON body', async () => {
    expect((await call('{nope')).status).toBe(400);
  });

  it('returns 400 when the phone is missing or too short', async () => {
    expect((await call('{}')).status).toBe(400);
    expect((await call(JSON.stringify({ phone: '123' }))).status).toBe(400);
    expect(getOrderForTracking).not.toHaveBeenCalled();
  });

  it('returns the order and records nothing on a correct match', async () => {
    (getOrderForTracking as jest.Mock).mockResolvedValue({ ref: 'BCM-1' });
    const res = await call(goodBody);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ref: 'BCM-1' });
    expect(recordRateLimitHit).not.toHaveBeenCalled();
  });

  it('gives a wrong phone and an unknown ref the same 404 and counts both as failures', async () => {
    (getOrderForTracking as jest.Mock).mockResolvedValue(null);
    const wrongPhone = await call(goodBody, 'BCM-REAL');
    const unknownRef = await call(goodBody, 'BCM-NOPE');
    expect(wrongPhone.status).toBe(404);
    expect(unknownRef.status).toBe(404);
    expect(await wrongPhone.json()).toEqual(await unknownRef.json());
    expect(recordRateLimitHit).toHaveBeenCalledWith('track:ref:BCM-REAL');
    expect(recordRateLimitHit).toHaveBeenCalledWith('track:ip:1.2.3.4');
  });

  it('returns 429 with Retry-After without looking the order up once the ref is locked', async () => {
    (checkRateLimit as jest.Mock).mockImplementation(async (key: string) =>
      key.startsWith('track:ref:') ? { allowed: false, retryAfterSeconds: 120 } : { allowed: true },
    );
    const res = await call(goodBody);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('120');
    expect(getOrderForTracking).not.toHaveBeenCalled();
  });

  it('returns 429 when the IP is locked', async () => {
    (checkRateLimit as jest.Mock).mockImplementation(async (key: string) =>
      key.startsWith('track:ip:') ? { allowed: false, retryAfterSeconds: 30 } : { allowed: true },
    );
    const res = await call(goodBody);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
  });
});
