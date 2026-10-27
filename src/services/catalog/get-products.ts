import type { AppLocale } from '@/lib/localize';
import { prisma } from '@/lib/prisma';
import type { Product } from '@/services/catalog/types';
import { PRODUCT_INCLUDE, mapProduct } from './map-product';

export { mapProduct } from './map-product';

export const getProducts = async (locale: AppLocale): Promise<Product[]> => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: PRODUCT_INCLUDE,
    orderBy: [{ featuredUntil: 'desc' }, { createdAt: 'desc' }],
  });

  return products.map((product) => mapProduct(product, locale));
};
