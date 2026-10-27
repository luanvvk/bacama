import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

import { requireApiRole } from '@/lib/auth/api-guards';
import { canAccessSite, siteScopeFilter } from '@/lib/auth/scoped';
import { bakeryItemSchema } from '@/lib/schemas/bakery-item';
import { createBakeryItem, getAdminBakeryItems } from '@/services/catalog/bakery-item-admin';

export const GET = async (request: NextRequest) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  const { searchParams } = request.nextUrl;
  const page = await getAdminBakeryItems(siteScopeFilter(guard.user), {
    cursor: searchParams.get('cursor'),
  });

  return NextResponse.json(page);
};

export const POST = async (request: NextRequest) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  const parsed = bakeryItemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  if (!canAccessSite(guard.user, parsed.data.siteId)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const item = await createBakeryItem(parsed.data).catch((error: { code?: string }) => {
    // P2003: siteId does not reference an existing site.
    if (error?.code === 'P2003') return null;
    throw error;
  });
  if (!item) return NextResponse.json({ error: 'invalid_request' }, { status: 400 });

  revalidatePath('/bakery');
  revalidatePath('/');

  return NextResponse.json({ id: item.id, slug: item.slug }, { status: 201 });
};
