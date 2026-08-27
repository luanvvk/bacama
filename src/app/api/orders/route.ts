import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { createOrder, OrderValidationError } from '@/services/orders/create-order';

const orderItemSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['product', 'bakery', 'menu']).optional(),
  quantity: z.number().int().positive(),
  weight: z.string().optional(),
  grind: z.string().optional(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  customerName: z.string().min(1),
  phone: z.string().min(8),
  email: z.string().email(),
  note: z.string().optional(),
  paymentMethod: z.enum(['zalopay', 'momo', 'vnpay', 'bank', 'card', 'cod']),
  deliveryOption: z.string().min(1),
  address: z.string().optional(),
  province: z.string().optional(),
  locale: z.enum(['vi', 'en']),
});

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid order payload.' }, { status: 400 });
  }

  try {
    const order = await createOrder(parsed.data);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    throw error;
  }
};
