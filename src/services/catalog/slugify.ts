import { prisma } from '@/lib/prisma';

export const slugify = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';

export const uniqueMenuItemSlug = async (siteId: string, nameEn: string): Promise<string> => {
  const base = slugify(nameEn);
  const existing = await prisma.menuItem.findMany({
    where: { siteId, slug: { startsWith: base } },
    select: { slug: true },
  });
  const taken = new Set(existing.map((item) => item.slug));

  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;

  return `${base}-${suffix}`;
};
