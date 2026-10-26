import { NextResponse, type NextRequest } from 'next/server';

import { getOrderStatus } from '@/services/orders/get-order-status';

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ ref: string }> },
) => {
  const { ref } = await params;
  const status = await getOrderStatus(ref);

  if (!status) {
    return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
  }

  return NextResponse.json({ status });
};
