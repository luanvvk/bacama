import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { getAuthProvider } from '@/lib/providers/auth';
import { createOrder, OrderValidationError } from '@/services/orders/create-order';

const orderItemSchema = z.object({
  id: z.string().min(1).max(100),
  kind: z.enum(['product', 'bakery', 'menu']).optional(),
  quantity: z.number().int().positive().max(99),
  weight: z.string().max(50).optional(),
  grind: z.string().max(50).optional(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1).max(50),
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

export const POST = async (request: NextRequest) => {
  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid order payload.' }, { status: 400 });
  }

  const userId = (await getAuthProvider().getCurrentUser())?.id ?? null;

  try {
    const order = await createOrder({ ...parsed.data, userId });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    throw error;
  }
};
