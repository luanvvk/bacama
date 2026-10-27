import { prisma } from '@/lib/prisma';
import type { SiteValues } from '@/lib/schemas/site';

export interface AdminSite {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  addressVi: string;
  addressEn: string;
  hoursVi: string;
  hoursEn: string;
  isActive: boolean;
  todaysRoastProductId: string | null;
}

export interface RoastProductOption {
  id: string;
  name: string;
}

const ADMIN_SITE_SELECT = {
  id: true,
  slug: true,
  nameVi: true,
  nameEn: true,
  addressVi: true,
  addressEn: true,
  hoursVi: true,
  hoursEn: true,
  isActive: true,
  todaysRoastProductId: true,
} as const;

export const getAdminSites = (): Promise<AdminSite[]> =>
  prisma.site.findMany({ select: ADMIN_SITE_SELECT, orderBy: { createdAt: 'asc' } });

export const getAdminSiteBySlug = (slug: string): Promise<AdminSite | null> =>
  prisma.site.findUnique({ where: { slug }, select: ADMIN_SITE_SELECT });

export const findSiteForUpdate = (id: string) =>
  prisma.site.findUnique({ where: { id }, select: { id: true, slug: true } });

export const getActiveProductOptions = async (): Promise<RoastProductOption[]> => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, nameEn: true },
    orderBy: { nameEn: 'asc' },
  });

  return products.map((product) => ({ id: product.id, name: product.nameEn }));
};

export const isActiveProduct = async (id: string): Promise<boolean> =>
  (await prisma.product.count({ where: { id, isActive: true } })) > 0;

export const updateSite = (id: string, values: SiteValues) =>
  prisma.site.update({ where: { id }, data: values });
