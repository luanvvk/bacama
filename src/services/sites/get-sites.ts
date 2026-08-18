import { prisma } from '@/lib/prisma';

import { SITE_INCLUDE, mapSite, type Site } from './map-site';

export { mapSite, formatOpening, type Site } from './map-site';

// Site has no explicit ordering column; seed order is insertion order, which is
// also the order the sites opened, so "Site 01/02/03" stays stable.
export const getSites = async (): Promise<Site[]> => {
  const sites = await prisma.site.findMany({
    where: { isActive: true },
    include: SITE_INCLUDE,
    orderBy: { createdAt: 'asc' },
  });

  return sites.map((site) => mapSite(site));
};
