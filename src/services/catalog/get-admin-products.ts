import type { Prisma } from '@/generated/prisma/client';
import { toHcmDateString } from '@/lib/hcm-date';
import { prisma } from '@/lib/prisma';

import type { AdminProduct } from './admin-product';

const mapAdminProduct = (product: Prisma.ProductGetPayload<object>): AdminProduct => ({
  id: product.id,
  slug: product.slug,
  name: product.nameEn,
  category: product.category,
  origin: product.originEn,
  imageUrl: product.imageUrl ?? product.images[0] ?? '',
  priceVnd: product.priceVnd,
  stock: product.stock,
  reorderLevel: product.reorderLevel,
  roastDate: toHcmDateString(product.roastDate),
  featuredUntil: toHcmDateString(product.featuredUntil),
  isActive: product.isActive,
});

export const getAdminProducts = async (): Promise<AdminProduct[]> => {
  const products = await prisma.product.findMany({ orderBy: { nameEn: 'asc' } });

  return products.map(mapAdminProduct);
};

export const getAdminProductBySlug = async (slug: string): Promise<AdminProduct | null> => {
  const product = await prisma.product.findUnique({ where: { slug } });

  return product ? mapAdminProduct(product) : null;
};
