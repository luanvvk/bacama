import { prisma } from '@/lib/prisma';
import type { BakeryItemValues } from '@/lib/schemas/bakery-item';
import { pageArgs, toPage, type Page, type PageParams } from '@/services/paging';

export const slugify = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';

const uniqueSlug = async (siteId: string, base: string): Promise<string> => {
  const taken = new Set(
    (
      await prisma.bakeryItem.findMany({
        where: { siteId, slug: { startsWith: base } },
        select: { slug: true },
      })
    ).map((item) => item.slug),
  );

  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;

  return `${base}-${suffix}`;
};

export const createBakeryItem = async (values: BakeryItemValues) =>
  prisma.bakeryItem.create({
    data: { ...values, slug: await uniqueSlug(values.siteId, slugify(values.nameEn)) },
  });

// siteId and slug are deliberately not editable: an item never moves site and its URL stays stable.
export const updateBakeryItem = async (id: string, values: BakeryItemValues) => {
  const { siteId: _siteId, ...data } = values;

  return prisma.bakeryItem.update({ where: { id }, data });
};

// Ordered items cannot be hard-deleted (OrderItem.bakeryItemId is onDelete: Restrict).
export const deactivateBakeryItem = async (id: string) =>
  prisma.bakeryItem.update({ where: { id }, data: { isActive: false } });

export const findBakeryItemSite = async (id: string) =>
  prisma.bakeryItem.findUnique({ where: { id }, select: { id: true, siteId: true } });

export interface AdminBakeryItem {
  id: string;
  slug: string;
  siteId: string;
  siteName: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  priceVnd: number;
  bakesAt: string;
  sellOutBy: string | null;
  handoff: BakeryItemValues['handoff'];
  handoffUrl: string | null;
  isActive: boolean;
}

export const getAdminBakeryItems = async (
  scope: { siteId?: string },
  params: PageParams = {},
): Promise<Page<AdminBakeryItem>> => {
  const rows = await prisma.bakeryItem.findMany({
    where: scope,
    include: { site: { select: { nameEn: true } } },
    orderBy: [{ siteId: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    ...pageArgs(params),
  });
  const { items, nextCursor } = toPage(rows, params);

  return {
    nextCursor,
    items: items.map(({ site, ...item }) => ({
      id: item.id,
      slug: item.slug,
      siteId: item.siteId,
      siteName: site.nameEn,
      nameVi: item.nameVi,
      nameEn: item.nameEn,
      descriptionVi: item.descriptionVi,
      descriptionEn: item.descriptionEn,
      priceVnd: item.priceVnd,
      bakesAt: item.bakesAt,
      sellOutBy: item.sellOutBy,
      handoff: item.handoff,
      handoffUrl: item.handoffUrl,
      isActive: item.isActive,
    })),
  };
};
