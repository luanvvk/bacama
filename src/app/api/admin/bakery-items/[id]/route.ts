import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

import { requireApiRole } from '@/lib/auth/api-guards';
import { canAccessSite } from '@/lib/auth/scoped';
import { bakeryItemSchema } from '@/lib/schemas/bakery-item';
import {
  deactivateBakeryItem,
  findBakeryItemSite,
  updateBakeryItem,
} from '@/services/catalog/bakery-item-admin';

type RouteContext = { params: Promise<{ id: string }> };

const revalidateStorefront = () => {
  revalidatePath('/bakery');
  revalidatePath('/');
};

export const PATCH = async (request: NextRequest, { params }: RouteContext) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const existing = await findBakeryItemSite(id);
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (!canAccessSite(guard.user, existing.siteId)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const parsed = bakeryItemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  await updateBakeryItem(id, parsed.data);
  revalidateStorefront();

  return NextResponse.json({ id });
};

export const DELETE = async (_request: NextRequest, { params }: RouteContext) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const existing = await findBakeryItemSite(id);
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (!canAccessSite(guard.user, existing.siteId)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  await deactivateBakeryItem(id);
  revalidateStorefront();

  return NextResponse.json({ id, isActive: false });
};
