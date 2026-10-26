import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

import { requireApiRole } from '@/lib/auth/api-guards';
import { MenuItemNotFoundError, SiteForbiddenError } from '@/services/catalog/menu-item-errors';
import { updateMenuItemSchema } from '@/services/catalog/menu-item-schema';
import { deactivateMenuItem, updateMenuItem } from '@/services/catalog/update-menu-item';

type RouteContext = { params: Promise<{ id: string }> };

const errorResponse = (error: unknown) => {
  if (error instanceof SiteForbiddenError) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (error instanceof MenuItemNotFoundError) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  throw error;
};

export const PATCH = async (request: NextRequest, { params }: RouteContext) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const parsed = updateMenuItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  try {
    const { id } = await params;
    const item = await updateMenuItem(guard.user, id, parsed.data);
    revalidatePath('/menu');
    return NextResponse.json({ id: item.id });
  } catch (error) {
    return errorResponse(error);
  }
};

export const DELETE = async (_request: NextRequest, { params }: RouteContext) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;
    const item = await deactivateMenuItem(guard.user, id);
    revalidatePath('/menu');
    return NextResponse.json({ id: item.id });
  } catch (error) {
    return errorResponse(error);
  }
};
