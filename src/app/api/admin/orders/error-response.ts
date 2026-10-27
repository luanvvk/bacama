import { NextResponse } from 'next/server';

import { AdminOrderConflictError, AdminOrderNotFoundError } from '@/services/orders/admin-orders';

export const orderErrorResponse = (error: unknown) => {
  if (error instanceof AdminOrderNotFoundError) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (error instanceof AdminOrderConflictError) {
    return NextResponse.json({ error: 'conflict' }, { status: 409 });
  }
  throw error;
};
