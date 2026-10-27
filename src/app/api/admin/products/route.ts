import { NextResponse, type NextRequest } from 'next/server';

import { requireApiRole } from '@/lib/auth/api-guards';
import { getAdminProductsPage } from '@/services/catalog/get-admin-products';

export const GET = async (request: NextRequest) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  const { searchParams } = request.nextUrl;
  const page = await getAdminProductsPage({ cursor: searchParams.get('cursor') });

  return NextResponse.json(page);
};
