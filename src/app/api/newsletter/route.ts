import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { hitRateLimit, type RateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  locale: z.enum(['vi', 'en']),
});

const IP_LIMIT: RateLimit = { max: 5, windowMs: 15 * 60_000 };

// Vercel overwrites x-forwarded-for with the real client IP; behind another proxy this is spoofable.
const clientIp = (request: NextRequest) =>
  request.headers.get('x-forwarded-for')?.split(',')[0].trim().slice(0, 64) || 'unknown';

export const POST = async (request: NextRequest) => {
  const parsed = subscribeSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
  }

  // Every request counts (no release): this endpoint has no "success" worth rewarding.
  const hit = await hitRateLimit(`newsletter:ip:${clientIp(request)}`, IP_LIMIT);

  if (!hit.allowed) {
    return NextResponse.json(
      { message: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(hit.retryAfterSeconds) } },
    );
  }

  const { email, locale } = parsed.data;

  // Duplicate-safe and silent about it, so the form cannot be used to probe who is subscribed.
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email, locale },
    update: {},
  });

  return NextResponse.json({ ok: true });
};
