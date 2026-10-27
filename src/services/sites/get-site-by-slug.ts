import type { AppLocale } from '@/lib/localize';
import { prisma } from '@/lib/prisma';

import { SITE_INCLUDE, mapSite, type Site } from './map-site';

export const getSiteBySlug = async (slug: string, locale: AppLocale): Promise<Site | null> => {
  const site = await prisma.site.findFirst({
    where: { slug, isActive: true },
    include: SITE_INCLUDE,
  });

  return site ? mapSite(site, locale) : null;
};
