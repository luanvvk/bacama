import type { AuthUser } from '@/lib/providers/auth/types';
import { prisma } from '@/lib/prisma';

export interface AdminAnnouncement {
  id: string;
  siteId: string | null;
  /** Null for an all-sites announcement. */
  siteName: string | null;
  titleVi: string;
  titleEn: string;
  bodyVi: string;
  bodyEn: string;
  startsAt: Date;
  endsAt: Date | null;
  isActive: boolean;
}

// Staff see their own site's announcements plus the all-sites ones (read-only for them).
export const getAdminAnnouncements = async (user: AuthUser): Promise<AdminAnnouncement[]> => {
  const where =
    user.role === 'admin' ? {} : { OR: [{ siteId: user.homeSiteId ?? '' }, { siteId: null }] };

  const announcements = await prisma.announcement.findMany({
    where,
    include: { site: { select: { nameEn: true } } },
    orderBy: { startsAt: 'desc' },
  });

  return announcements.map(({ site, createdAt: _createdAt, updatedAt: _updatedAt, ...rest }) => ({
    ...rest,
    siteName: site?.nameEn ?? null,
  }));
};
