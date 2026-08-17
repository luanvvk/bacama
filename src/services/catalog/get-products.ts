import { prisma } from '@/lib/prisma';
import type { Product } from '@/constants/products';
import { PRODUCT_INCLUDE, mapProduct } from './map-product';

export { mapProduct } from './map-product';

export const getProducts = async (): Promise<Product[]> => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: PRODUCT_INCLUDE,
    orderBy: [{ featuredUntil: 'desc' }, { createdAt: 'desc' }],
  });

  return products.map(mapProduct);
};
