import { NextResponse, type NextRequest } from 'next/server';

import { requireApiRole } from '@/lib/auth/api-guards';
import { getAdminOrder } from '@/services/orders/admin-orders';

type RouteContext = { params: Promise<{ ref: string }> };

export const GET = async (_request: NextRequest, { params }: RouteContext) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  const { ref } = await params;
  const order = await getAdminOrder(guard.user, ref);
  if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  return NextResponse.json(order);
};
