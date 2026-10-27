import { NextResponse, type NextRequest } from 'next/server';

import { requireApiRole } from '@/lib/auth/api-guards';
import { listAdminOrders, type AdminOrderFilter } from '@/services/orders/admin-orders';

const FILTERS: AdminOrderFilter[] = ['all', 'ack', 'cod', 'failed'];

export const GET = async (request: NextRequest) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  const params = request.nextUrl.searchParams;
  const filter = FILTERS.find((value) => value === params.get('filter')) ?? 'all';
  const page = Number.parseInt(params.get('page') ?? '1', 10);

  const result = await listAdminOrders(guard.user, {
    page: Number.isFinite(page) ? page : 1,
    filter,
    query: params.get('q') ?? undefined,
  });

  return NextResponse.json(result);
};
