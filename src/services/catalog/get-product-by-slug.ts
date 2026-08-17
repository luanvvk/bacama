import { prisma } from '@/lib/prisma';
import type { Product } from '@/constants/products';

import { PRODUCT_INCLUDE, mapProduct } from './map-product';

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: PRODUCT_INCLUDE,
  });

  return product ? mapProduct(product) : null;
};
