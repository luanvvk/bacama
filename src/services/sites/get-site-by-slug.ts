import { prisma } from '@/lib/prisma';

import { SITE_INCLUDE, mapSite, type Site } from './map-site';

export const getSiteBySlug = async (slug: string): Promise<Site | null> => {
  const site = await prisma.site.findFirst({
    where: { slug, isActive: true },
    include: SITE_INCLUDE,
  });

  return site ? mapSite(site) : null;
};
