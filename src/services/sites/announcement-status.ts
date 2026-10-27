export type AnnouncementStatus = 'live' | 'scheduled' | 'expired' | 'draft';

interface AnnouncementWindow {
  isActive: boolean;
  startsAt: Date | string;
  endsAt: Date | string | null;
}

// Boundaries match `getActiveAnnouncements`: starting or ending exactly now is still live.
export const getAnnouncementStatus = (
  announcement: AnnouncementWindow,
  now: Date,
): AnnouncementStatus => {
  if (!announcement.isActive) return 'draft';
  if (new Date(announcement.startsAt) > now) return 'scheduled';
  if (announcement.endsAt && new Date(announcement.endsAt) < now) return 'expired';

  return 'live';
};
