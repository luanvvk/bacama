import { canAccessSite } from '@/lib/auth/scoped';
import type { AuthUser } from '@/lib/providers/auth/types';
import { prisma } from '@/lib/prisma';

import { AnnouncementForbiddenError, AnnouncementNotFoundError } from './announcement-errors';
import type { AnnouncementInput } from './announcement-schema';

// An all-sites announcement (siteId null) is admin-only; otherwise the usual site scope applies.
export const canWriteAnnouncementSite = (user: AuthUser, siteId: string | null): boolean =>
  siteId === null ? user.role === 'admin' : canAccessSite(user, siteId);

const assertCanWrite = (user: AuthUser, siteId: string | null) => {
  if (!canWriteAnnouncementSite(user, siteId)) throw new AnnouncementForbiddenError();
};

const loadStoredSiteId = async (id: string) => {
  const stored = await prisma.announcement.findUnique({ where: { id }, select: { siteId: true } });

  if (!stored) throw new AnnouncementNotFoundError();

  return stored.siteId;
};

export const createAnnouncement = async (user: AuthUser, input: AnnouncementInput) => {
  assertCanWrite(user, input.siteId);

  return prisma.announcement.create({ data: { ...input, endsAt: input.endsAt ?? null } });
};

// Both the stored and the requested scope must be writable, so staff cannot
// repoint a row to another site or to all sites.
export const updateAnnouncement = async (user: AuthUser, id: string, input: AnnouncementInput) => {
  assertCanWrite(user, await loadStoredSiteId(id));
  assertCanWrite(user, input.siteId);

  return prisma.announcement.update({
    where: { id },
    data: { ...input, endsAt: input.endsAt ?? null },
  });
};

export const deleteAnnouncement = async (user: AuthUser, id: string) => {
  assertCanWrite(user, await loadStoredSiteId(id));

  return prisma.announcement.delete({ where: { id } });
};
