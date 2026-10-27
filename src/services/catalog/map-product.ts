import type { Prisma } from '@/generated/prisma/client';
import type { Product } from '@/services/catalog/types';
import { pickLocalized, type AppLocale } from '@/lib/localize';
import { formatFreshness } from '@/lib/format-freshness';

export const PRODUCT_INCLUDE = {
  brewGuides: { orderBy: { order: 'asc' as const } },
} satisfies Prisma.ProductInclude;

export type DatabaseProduct = Prisma.ProductGetPayload<{ include: typeof PRODUCT_INCLUDE }>;

export const mapProduct = (product: DatabaseProduct, locale: AppLocale): Product => ({
  id: product.id,
  slug: product.slug,
  name: pickLocalized(locale, product.nameVi, product.nameEn),
  category: product.category,
  roastLevel: product.roastLevel ?? undefined,
  origin: pickLocalized(locale, product.originVi, product.originEn) ?? undefined,
  priceVnd: product.priceVnd,
  description: pickLocalized(locale, product.descriptionVi, product.descriptionEn),
  imageUrl: product.imageUrl ?? product.images[0] ?? '',
  images: product.images.length > 0 ? product.images : product.imageUrl ? [product.imageUrl] : [],
  freshness: formatFreshness(product.roastDate),
  soldOut: product.stock <= 0,
  swatches: [...product.weightOptions, ...product.grindOptions],
  tastingNotes:
    locale === 'vi' && product.tastingNotesVi.length > 0
      ? product.tastingNotesVi
      : product.tastingNotesEn,
  weightOptions: product.weightOptions,
  grindOptions: product.grindOptions.map((label) => ({ label })),
  brewGuide: product.brewGuides.map((guide) => ({
    method: guide.method,
    ratio: guide.ratio,
    detail: pickLocalized(locale, guide.detailVi, guide.detailEn),
  })),
  originStory: pickLocalized(locale, product.originStoryVi, product.originStoryEn) ?? undefined,
});
