import type { AppLocale } from '@/lib/localize';
import { prisma } from '@/lib/prisma';
import type { Product } from '@/services/catalog/types';

import { mapProduct } from './map-product';

export const getFeaturedProducts = async (locale: AppLocale): Promise<Product[]> => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      featuredUntil: { gte: new Date() },
    },
    include: {
      brewGuides: { orderBy: { order: 'asc' } },
    },
    orderBy: { featuredUntil: 'asc' },
    take: 3,
  });

  return products.map((product) => mapProduct(product, locale));
};
