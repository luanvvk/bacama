import { prisma } from '@/lib/prisma';

export interface BakeryCatalogItem {
  id: string;
  slug: string;
  siteId: string;
  siteSlug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  priceVnd: number;
  bakesAt: string;
  sellOutBy: string | null;
  handoff: string;
  handoffUrl: string | null;
}

export const getBakeryItems = async (): Promise<BakeryCatalogItem[]> => {
  const items = await prisma.bakeryItem.findMany({
    where: { isActive: true, site: { isActive: true } },
    include: { site: { select: { slug: true } } },
    orderBy: [{ bakesAt: 'asc' }, { createdAt: 'asc' }],
  });

  return items.map((item) => ({
    id: item.id,
    slug: item.slug,
    siteId: item.siteId,
    siteSlug: item.site.slug,
    name: item.nameEn,
    description: item.descriptionEn,
    imageUrl: item.imageUrl,
    priceVnd: item.priceVnd,
    bakesAt: item.bakesAt,
    sellOutBy: item.sellOutBy,
    handoff: item.handoff,
    handoffUrl: item.handoffUrl,
  }));
};
