import { prisma } from '@/lib/prisma';
import type { Product } from '@/constants/products';

import { mapProduct } from './map-product';

export const getFeaturedProducts = async (): Promise<Product[]> => {
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

  return products.map(mapProduct);
};
