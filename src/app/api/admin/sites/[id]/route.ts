import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

import { requireApiRole } from '@/lib/auth/api-guards';
import { siteSchema } from '@/lib/schemas/site';
import { findSiteForUpdate, isActiveProduct, updateSite } from '@/services/sites/site-admin';

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = async (request: NextRequest, { params }: RouteContext) => {
  const guard = await requireApiRole(['admin']);
  if (!guard.ok) return guard.response;

  const parsed = siteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const { id } = await params;
  const existing = await findSiteForUpdate(id);
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const { todaysRoastProductId } = parsed.data;
  if (todaysRoastProductId !== null && !(await isActiveProduct(todaysRoastProductId))) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  await updateSite(id, parsed.data);
  revalidatePath(`/sites/${existing.slug}`);
  revalidatePath('/');
  revalidatePath('/menu');

  return NextResponse.json({ id });
};
