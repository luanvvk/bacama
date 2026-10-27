import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

import { requireApiRole } from '@/lib/auth/api-guards';
import { updateProduct, updateProductSchema } from '@/services/catalog/update-product';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const PATCH = async (request: NextRequest, { params }: RouteContext) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const { id } = await params;
  const product = await updateProduct(id, parsed.data);
  if (!product) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  revalidatePath('/shop');
  revalidatePath(`/product/${product.slug}`);
  revalidatePath('/');

  return NextResponse.json({ id: product.id });
};
