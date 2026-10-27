import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { hitRateLimit, releaseRateLimitHit, type RateLimit } from '@/lib/rate-limit';
import { getOrderForTracking } from '@/services/orders/get-order-for-tracking';

const trackOrderSchema = z.object({ phone: z.string().min(8).max(20) });

const MAX_REF_LENGTH = 40;
const REF_LIMIT: RateLimit = { max: 5, windowMs: 15 * 60_000 };
const IP_LIMIT: RateLimit = { max: 20, windowMs: 15 * 60_000 };

// Vercel overwrites x-forwarded-for with the real client IP; behind another proxy this is spoofable.
const clientIp = (request: NextRequest) =>
  request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ ref: string }> },
) => {
  const { ref } = await params;
  const parsed = trackOrderSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success || ref.length > MAX_REF_LENGTH) {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
  }

  // Count the attempt before looking the order up, so parallel guesses cannot
  // all pass the check; a correct match releases its hits again.
  const [refHit, ipHit] = await Promise.all([
    hitRateLimit(`track:ref:${ref.toUpperCase()}`, REF_LIMIT),
    hitRateLimit(`track:ip:${clientIp(request)}`, IP_LIMIT),
  ]);

  if (!refHit.allowed || !ipHit.allowed) {
    const retryAfter = Math.max(
      refHit.allowed ? 0 : refHit.retryAfterSeconds,
      ipHit.allowed ? 0 : ipHit.retryAfterSeconds,
    );
    return NextResponse.json(
      { message: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  const order = await getOrderForTracking(ref, parsed.data.phone);

  if (!order) {
    return NextResponse.json(
      { message: 'No order found for that reference and phone.' },
      { status: 404 },
    );
  }

  await releaseRateLimitHit([refHit.hitId, ipHit.hitId]);

  return NextResponse.json(order);
};
