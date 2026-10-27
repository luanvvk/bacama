import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

import { requireApiRole } from '@/lib/auth/api-guards';
import { createMenuItem } from '@/services/catalog/create-menu-item';
import { getAdminMenuItems } from '@/services/catalog/get-admin-menu-items';
import { SiteForbiddenError } from '@/services/catalog/menu-item-errors';
import { createMenuItemSchema } from '@/services/catalog/menu-item-schema';

export const GET = async (request: NextRequest) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  const page = await getAdminMenuItems(guard.user, {
    cursor: request.nextUrl.searchParams.get('cursor'),
  });

  return NextResponse.json(page);
};

export const POST = async (request: NextRequest) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const parsed = createMenuItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  try {
    const item = await createMenuItem(guard.user, parsed.data);
    revalidatePath('/menu');
    return NextResponse.json({ id: item.id, slug: item.slug }, { status: 201 });
  } catch (error) {
    if (error instanceof SiteForbiddenError) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    if ((error as { code?: unknown } | null)?.code === 'P2002') {
      return NextResponse.json({ error: 'conflict' }, { status: 409 });
    }
    throw error;
  }
};
