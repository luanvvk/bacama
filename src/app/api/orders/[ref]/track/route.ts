import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { checkRateLimit, recordRateLimitHit, type RateLimit } from '@/lib/rate-limit';
import { getOrderForTracking } from '@/services/orders/get-order-for-tracking';

const trackOrderSchema = z.object({ phone: z.string().min(8).max(20) });

const REF_LIMIT: RateLimit = { max: 5, windowMs: 15 * 60_000 };
const IP_LIMIT: RateLimit = { max: 20, windowMs: 15 * 60_000 };

const clientIp = (request: NextRequest) =>
  request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ ref: string }> },
) => {
  const { ref } = await params;
  const parsed = trackOrderSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
  }

  const refKey = `track:ref:${ref.toUpperCase()}`;
  const ipKey = `track:ip:${clientIp(request)}`;
  const [refCheck, ipCheck] = await Promise.all([
    checkRateLimit(refKey, REF_LIMIT),
    checkRateLimit(ipKey, IP_LIMIT),
  ]);

  if (!refCheck.allowed || !ipCheck.allowed) {
    const retryAfter = Math.max(
      refCheck.allowed ? 0 : refCheck.retryAfterSeconds,
      ipCheck.allowed ? 0 : ipCheck.retryAfterSeconds,
    );
    return NextResponse.json(
      { message: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  const order = await getOrderForTracking(ref, parsed.data.phone);

  if (!order) {
    await Promise.all([recordRateLimitHit(refKey), recordRateLimitHit(ipKey)]);
    return NextResponse.json(
      { message: 'No order found for that reference and phone.' },
      { status: 404 },
    );
  }

  return NextResponse.json(order);
};
