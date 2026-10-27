import { pickLocalized, type AppLocale } from '@/lib/localize';
import { prisma } from '@/lib/prisma';

export interface MenuCatalogItem {
  id: string;
  slug: string;
  section: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceVnd: number;
}

export const getMenuItems = async (locale: AppLocale): Promise<MenuCatalogItem[]> => {
  const items = await prisma.menuItem.findMany({
    where: { isActive: true, site: { isActive: true } },
    orderBy: [{ section: 'asc' }, { order: 'asc' }],
  });

  return items.map((item) => ({
    id: item.id,
    slug: item.slug,
    section: item.section,
    name: pickLocalized(locale, item.nameVi, item.nameEn),
    description: pickLocalized(locale, item.descriptionVi, item.descriptionEn),
    imageUrl: item.imageUrl,
    priceVnd: item.priceVnd,
  }));
};
