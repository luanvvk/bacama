import { NextResponse } from 'next/server';

import { releaseSeatHolds } from '@/lib/sweeps/seat-hold';
import { isAuthorizedCronRequest } from '@/lib/sweeps/verify-cron-request';

export const dynamic = 'force-dynamic';

export const GET = async (request: Request) => {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await releaseSeatHolds());
};
