import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toVietnamLocalInput } from '@/lib/vn-datetime';
import { getAnnouncementStatus } from '@/services/sites/announcement-status';
import type { AdminAnnouncement } from '@/services/sites/get-admin-announcements';

const STATUS_VARIANT = {
  live: 'success',
  scheduled: 'warning',
  expired: 'outline',
  draft: 'outline',
} as const;

export const AnnouncementsPanel = ({ announcements }: { announcements: AdminAnnouncement[] }) => {
  const t = useTranslations('Admin.announcements');
  const now = new Date();

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{t('title')}</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/announcements">+ {t('new')}</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {announcements.length === 0 && (
          <p className="text-muted-foreground text-sm">{t('empty')}</p>
        )}
        {announcements.map((announcement) => {
          const status = getAnnouncementStatus(announcement, now);

          return (
            <div key={announcement.id} className="border-b pb-4 last:border-0 last:pb-0">
              <p className="text-sm font-semibold">{announcement.titleEn}</p>
              <p className="text-muted-foreground mt-1 text-sm">{announcement.bodyEn}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={STATUS_VARIANT[status]}>{t(`statuses.${status}`)}</Badge>
                <span className="text-muted-foreground font-mono text-xs">
                  {announcement.siteName ?? t('allSites')} ·{' '}
                  {toVietnamLocalInput(announcement.startsAt).replace('T', ' ')}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
