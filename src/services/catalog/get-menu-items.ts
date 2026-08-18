import { prisma } from '@/lib/prisma';

export interface MenuCatalogItem {
  id: string;
  slug: string;
  section: string;
  name: string;
  priceVnd: number;
}

export const getMenuItems = async (): Promise<MenuCatalogItem[]> => {
  const items = await prisma.menuItem.findMany({
    where: { isActive: true, site: { isActive: true } },
    orderBy: [{ section: 'asc' }, { order: 'asc' }],
  });

  return items.map((item) => ({
    id: item.id,
    slug: item.slug,
    section: item.section,
    name: item.nameEn,
    priceVnd: item.priceVnd,
  }));
};
