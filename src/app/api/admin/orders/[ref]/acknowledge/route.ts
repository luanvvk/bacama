import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

import { orderErrorResponse } from '@/app/api/admin/orders/error-response';
import { requireApiRole } from '@/lib/auth/api-guards';
import { acknowledgeOrder } from '@/services/orders/admin-orders';

type RouteContext = { params: Promise<{ ref: string }> };

export const POST = async (_request: NextRequest, { params }: RouteContext) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  try {
    const { ref } = await params;
    await acknowledgeOrder(guard.user, ref);
    revalidatePath('/admin/orders');
    return NextResponse.json({ ref });
  } catch (error) {
    return orderErrorResponse(error);
  }
};
