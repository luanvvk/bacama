import type { Prisma } from '@/generated/prisma/client';

export const SITE_INCLUDE = {
  todaysRoastProduct: { select: { slug: true, nameEn: true } },
  _count: { select: { menuItems: true, bakeryItems: true } },
} satisfies Prisma.SiteInclude;

export type DatabaseSite = Prisma.SiteGetPayload<{ include: typeof SITE_INCLUDE }>;

export interface Site {
  id: string;
  slug: string;
  city: string;
  name: string;
  /** Street address alone — safe to use as a map query. */
  address: string;
  addressNote?: string;
  hoursDays: string;
  hoursTimes?: string;
  imageUrl?: string;
  /** Null once open; a future date for a site that hasn't opened yet. */
  opensAt: Date | null;
  comingSoon: boolean;
  /** Whether this site actually has drinks / bakery of its own to collect. */
  servesMenu: boolean;
  servesBakery: boolean;
  todaysRoast?: { slug: string; name: string };
}

const OPENING_MONTH = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  // Pinned so a UTC-midnight opensAt never renders as the previous month for a
  // reader west of UTC. Every site is in Vietnam (Site.timezone defaults to it).
  timeZone: 'Asia/Ho_Chi_Minh',
});

export const formatOpening = (opensAt: Date) => OPENING_MONTH.format(opensAt);

// Site address and hours both use " · " to append an editorial aside
// ("… Hội An · Weekend cupping", "Every day · 7 a.m. – 9 p.m."). Split once
// here so the address stays geocodable and the hours can be styled in parts.
const splitAside = (value: string) => {
  const [head, ...rest] = value.split(' · ');
  const aside = rest.join(' · ');
  return { head, aside: aside || undefined };
};

export const mapSite = (site: DatabaseSite, now = new Date()): Site => {
  const address = splitAside(site.addressEn);
  const hours = splitAside(site.hoursEn);

  return {
    id: site.id,
    slug: site.slug,
    city: site.city,
    name: site.nameEn,
    address: address.head,
    addressNote: address.aside,
    hoursDays: hours.head,
    hoursTimes: hours.aside,
    imageUrl: site.imageUrl ?? undefined,
    opensAt: site.opensAt,
    comingSoon: site.opensAt !== null && site.opensAt.getTime() > now.getTime(),
    servesMenu: site._count.menuItems > 0,
    servesBakery: site._count.bakeryItems > 0,
    todaysRoast: site.todaysRoastProduct
      ? { slug: site.todaysRoastProduct.slug, name: site.todaysRoastProduct.nameEn }
      : undefined,
  };
};
