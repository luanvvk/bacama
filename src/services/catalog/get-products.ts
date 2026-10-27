import type { AppLocale } from '@/lib/localize';
import { prisma } from '@/lib/prisma';
import type { Product } from '@/services/catalog/types';
import { PRODUCT_INCLUDE, mapProduct } from './map-product';

export { mapProduct } from './map-product';

export const getProducts = async (locale: AppLocale): Promise<Product[]> => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: PRODUCT_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

  // Postgres sorts NULLs first on DESC, so rank featured products here: only an unexpired
  // featuredUntil counts. Array.sort is stable, so non-featured keep newest-first order.
  const now = Date.now();
  const featuredAt = (product: { featuredUntil: Date | null }) =>
    product.featuredUntil && product.featuredUntil.getTime() >= now
      ? product.featuredUntil.getTime()
      : 0;
  products.sort((a, b) => featuredAt(b) - featuredAt(a));

  return products.map((product) => mapProduct(product, locale));
};
