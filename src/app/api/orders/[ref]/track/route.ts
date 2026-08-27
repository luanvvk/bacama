import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { getOrderForTracking } from '@/services/orders/get-order-for-tracking';

const trackOrderSchema = z.object({ phone: z.string().min(8) });

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ ref: string }> },
) => {
  const { ref } = await params;
  const parsed = trackOrderSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
  }

  const order = await getOrderForTracking(ref, parsed.data.phone);

  if (!order) {
    return NextResponse.json(
      { message: 'No order found for that reference and phone.' },
      { status: 404 },
    );
  }

  return NextResponse.json(order);
};
