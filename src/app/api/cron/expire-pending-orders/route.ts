import { NextResponse } from 'next/server';

import { expireAwaitingCodOrders } from '@/lib/sweeps/expire-awaiting-cod-orders';
import { expirePendingOrders } from '@/lib/sweeps/expire-pending-orders';
import { isAuthorizedCronRequest } from '@/lib/sweeps/verify-cron-request';

export const dynamic = 'force-dynamic';

export const GET = async (request: Request) => {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const [pending, cod] = await Promise.all([expirePendingOrders(), expireAwaitingCodOrders()]);
  return NextResponse.json({ ...pending, expiredCod: cod.expired });
};
