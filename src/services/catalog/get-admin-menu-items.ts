import { siteScopeFilter } from '@/lib/auth/scoped';
import type { AuthUser } from '@/lib/providers/auth/types';
import { prisma } from '@/lib/prisma';
import { pageArgs, toPage, type Page, type PageParams } from '@/services/paging';

export interface AdminMenuItem {
  id: string;
  siteId: string;
  siteName: string;
  section: string;
  nameVi: string;
  nameEn: string;
  priceVnd: number;
  imageUrl: string | null;
  descriptionVi: string | null;
  descriptionEn: string | null;
  order: number;
  isActive: boolean;
}

export const getAdminMenuItems = async (
  user: AuthUser,
  params: PageParams = {},
): Promise<Page<AdminMenuItem>> => {
  const rows = await prisma.menuItem.findMany({
    where: siteScopeFilter(user),
    include: { site: { select: { nameEn: true } } },
    orderBy: [{ section: 'asc' }, { order: 'asc' }, { id: 'asc' }],
    ...pageArgs(params),
  });
  const { items, nextCursor } = toPage(rows, params);

  return {
    nextCursor,
    items: items.map((item) => ({
      id: item.id,
      siteId: item.siteId,
      siteName: item.site.nameEn,
      section: item.section,
      nameVi: item.nameVi,
      nameEn: item.nameEn,
      priceVnd: item.priceVnd,
      imageUrl: item.imageUrl,
      descriptionVi: item.descriptionVi,
      descriptionEn: item.descriptionEn,
      order: item.order,
      isActive: item.isActive,
    })),
  };
};
