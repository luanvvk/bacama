/** @jest-environment node */
import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { hitRateLimit } from '@/lib/rate-limit';

import { POST } from './route';

jest.mock('@/lib/prisma', () => ({
  prisma: { newsletterSubscriber: { upsert: jest.fn() } },
}));
jest.mock('@/lib/rate-limit', () => ({ hitRateLimit: jest.fn() }));

const call = (body: string) =>
  POST(
    new NextRequest('http://localhost/api/newsletter', {
      method: 'POST',
      body,
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    }),
  );

describe('POST /api/newsletter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (hitRateLimit as jest.Mock).mockResolvedValue({ allowed: true, hitId: 'h1' });
  });

  it('returns 400 for a malformed body, bad email or unknown locale', async () => {
    expect((await call('{nope')).status).toBe(400);
    expect((await call(JSON.stringify({ email: 'nope', locale: 'en' }))).status).toBe(400);
    expect((await call(JSON.stringify({ email: 'a@b.co', locale: 'fr' }))).status).toBe(400);
    expect(prisma.newsletterSubscriber.upsert).not.toHaveBeenCalled();
  });

  it('stores a normalised email with an idempotent upsert', async () => {
    const res = await call(JSON.stringify({ email: ' Me@Example.COM ', locale: 'vi' }));
    expect(res.status).toBe(200);
    expect(prisma.newsletterSubscriber.upsert).toHaveBeenCalledWith({
      where: { email: 'me@example.com' },
      create: { email: 'me@example.com', locale: 'vi' },
      update: {},
    });
    expect(hitRateLimit).toHaveBeenCalledWith('newsletter:ip:1.2.3.4', expect.any(Object));
  });

  it('returns 429 with Retry-After and stores nothing when rate limited', async () => {
    (hitRateLimit as jest.Mock).mockResolvedValue({
      allowed: false,
      hitId: 'h1',
      retryAfterSeconds: 42,
    });
    const res = await call(JSON.stringify({ email: 'a@b.co', locale: 'en' }));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('42');
    expect(prisma.newsletterSubscriber.upsert).not.toHaveBeenCalled();
  });
});
