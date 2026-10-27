import { NextResponse, type NextRequest } from 'next/server';

import { requireApiRole } from '@/lib/auth/api-guards';
import { getAdminStaff } from '@/services/users/get-admin-staff';

export const GET = async (request: NextRequest) => {
  const guard = await requireApiRole(['admin']);
  if (!guard.ok) return guard.response;

  const page = await getAdminStaff({ cursor: request.nextUrl.searchParams.get('cursor') });

  return NextResponse.json(page);
};
