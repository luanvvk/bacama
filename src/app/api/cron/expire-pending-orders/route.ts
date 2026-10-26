import { NextResponse } from 'next/server';

import { expirePendingOrders } from '@/lib/sweeps/expire-pending-orders';
import { isAuthorizedCronRequest } from '@/lib/sweeps/verify-cron-request';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await expirePendingOrders());
}
