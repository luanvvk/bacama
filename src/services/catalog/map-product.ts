import type { Prisma } from '@/generated/prisma/client';
import type { Product } from '@/constants/products';
import { formatFreshness } from '@/lib/format-freshness';

export const PRODUCT_INCLUDE = {
  brewGuides: { orderBy: { order: 'asc' as const } },
} satisfies Prisma.ProductInclude;

export type DatabaseProduct = Prisma.ProductGetPayload<{ include: typeof PRODUCT_INCLUDE }>;

export const mapProduct = (product: DatabaseProduct): Product => ({
  id: product.id,
  slug: product.slug,
  name: product.nameEn,
  category: product.category,
  roastLevel: product.roastLevel ?? undefined,
  origin: product.originEn ?? undefined,
  priceVnd: product.priceVnd,
  description: product.descriptionEn,
  imageUrl: product.imageUrl ?? product.images[0] ?? '',
  images: product.images.length > 0 ? product.images : product.imageUrl ? [product.imageUrl] : [],
  freshness: formatFreshness(product.roastDate),
  soldOut: product.stock <= 0,
  swatches: [...product.weightOptions, ...product.grindOptions],
  tastingNotes: product.tastingNotesEn,
  weightOptions: product.weightOptions,
  grindOptions: product.grindOptions.map((label) => ({ label })),
  brewGuide: product.brewGuides.map((guide) => ({
    method: guide.method,
    ratio: guide.ratio,
    detail: guide.detailEn,
  })),
  originStory: product.originStoryEn ?? undefined,
});
