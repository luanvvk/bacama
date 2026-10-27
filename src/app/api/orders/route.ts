import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import {
  createOrderAccessToken,
  ORDER_ACCESS_MAX_AGE_SECONDS,
  orderAccessCookieName,
} from '@/lib/order-access';
import { hitRateLimit, type RateLimit } from '@/lib/rate-limit';
import { getAuthProvider } from '@/lib/providers/auth';
import { createOrder, OrderValidationError } from '@/services/orders/create-order';

const orderItemSchema = z.object({
  id: z.string().min(1).max(100),
  kind: z.enum(['product', 'bakery', 'menu']).optional(),
  quantity: z.number().int().positive().max(20),
  weight: z.string().max(50).optional(),
  grind: z.string().max(50).optional(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1).max(20),
  customerName: z.string().min(1).max(200),
  phone: z.string().min(8).max(20),
  email: z.string().email().max(254),
  note: z.string().max(1000).optional(),
  paymentMethod: z.enum(['zalopay', 'momo', 'vnpay_qr', 'bank_transfer', 'card', 'cod']),
  deliveryOption: z.string().min(1).max(100),
  address: z.string().max(500).optional(),
  province: z.string().max(100).optional(),
  locale: z.enum(['vi', 'en']),
});

const IP_LIMIT: RateLimit = { max: 10, windowMs: 60 * 60_000 };
const PHONE_LIMIT: RateLimit = { max: 5, windowMs: 60 * 60_000 };

// Vercel overwrites x-forwarded-for with the real client IP; behind another proxy this is spoofable.
const clientIp = (request: NextRequest) =>
  request.headers.get('x-forwarded-for')?.split(',')[0].trim().slice(0, 64) || 'unknown';

export const POST = async (request: NextRequest) => {
  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid order payload.' }, { status: 400 });
  }

  // Every attempt counts (hits are never released), so a script cannot place
  // unlimited orders that each take stock.
  const [ipHit, phoneHit] = await Promise.all([
    hitRateLimit(`order:ip:${clientIp(request)}`, IP_LIMIT),
    hitRateLimit(`order:phone:${parsed.data.phone.replace(/\D/g, '')}`, PHONE_LIMIT),
  ]);
  if (!ipHit.allowed || !phoneHit.allowed) {
    const retryAfter = Math.max(
      ipHit.allowed ? 0 : ipHit.retryAfterSeconds,
      phoneHit.allowed ? 0 : phoneHit.retryAfterSeconds,
    );
    return NextResponse.json(
      { message: 'Too many orders. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  const userId = (await getAuthProvider().getCurrentUser())?.id ?? null;

  try {
    const order = await createOrder({ ...parsed.data, userId });
    const response = NextResponse.json(order, { status: 201 });
    response.cookies.set(orderAccessCookieName(order.ref), createOrderAccessToken(order.ref), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/checkout',
      maxAge: ORDER_ACCESS_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    throw error;
  }
};
