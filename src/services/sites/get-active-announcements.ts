import { prisma } from '@/lib/prisma';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  /** Null for an announcement that applies to every site. */
  siteSlug: string | null;
}

// Passing a slug returns that site's announcements *plus* the site-wide ones —
// a site page should show both, not just its own.
export const getActiveAnnouncements = async (siteSlug?: string): Promise<Announcement[]> => {
  const now = new Date();

  const announcements = await prisma.announcement.findMany({
    where: {
      isActive: true,
      startsAt: { lte: now },
      AND: [
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ...(siteSlug ? [{ OR: [{ siteId: null }, { site: { slug: siteSlug } }] }] : []),
      ],
    },
    include: { site: { select: { slug: true } } },
    orderBy: { startsAt: 'desc' },
  });

  return announcements.map((announcement) => ({
    id: announcement.id,
    title: announcement.titleEn,
    body: announcement.bodyEn,
    siteSlug: announcement.site?.slug ?? null,
  }));
};
