'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Heading, Text } from '@/components/ui/Typography';
import { toast } from '@/lib/toast';
import { toVietnamLocalInput } from '@/lib/vn-datetime';
import {
  getAnnouncementStatus,
  type AnnouncementStatus,
} from '@/services/sites/announcement-status';
import type { AdminAnnouncement } from '@/services/sites/get-admin-announcements';

import { ALL_SITES, AnnouncementForm } from '../AnnouncementForm';

export interface AnnouncementsManagerProps {
  announcements: AdminAnnouncement[];
  /** Present only for admin, who may pick any site. */
  siteOptions?: { value: string; label: string }[];
  defaultSiteId: string | null;
  /** Admin may edit all-sites announcements; staff may only edit their own site's. */
  canManageAllSites: boolean;
}

type EditorState = { mode: 'create' } | { mode: 'edit'; announcement: AdminAnnouncement } | null;

const STATUS_VARIANT = {
  live: 'success',
  scheduled: 'warning',
  expired: 'outline',
  draft: 'outline',
} as const satisfies Record<AnnouncementStatus, 'success' | 'warning' | 'outline'>;

const formatInstant = (date: Date) => toVietnamLocalInput(date).replace('T', ' ');

export const AnnouncementsManager = ({
  announcements,
  siteOptions,
  defaultSiteId,
  canManageAllSites,
}: AnnouncementsManagerProps) => {
  const t = useTranslations('Admin.announcements');
  const router = useRouter();
  const [editor, setEditor] = useState<EditorState>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const canCreate = Boolean(siteOptions?.length || defaultSiteId);
  const now = new Date();

  const formSiteOptions = siteOptions && [
    { value: ALL_SITES, label: t('allSites') },
    ...siteOptions,
  ];

  const remove = async (announcement: AdminAnnouncement) => {
    const response = await fetch(`/api/admin/announcements/${announcement.id}`, {
      method: 'DELETE',
    });
    setConfirmingId(null);

    if (!response.ok) {
      toast.error(
        response.status === 403
          ? t('forbidden')
          : response.status === 404
            ? t('notFound')
            : t('deleteFailed'),
      );
      return;
    }

    toast.success(t('deleted'));
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Heading as="h1" size="lg">
            {t('title')}
          </Heading>
          <Text variant="muted" className="mt-1 max-w-2xl">
            {t('description')}
          </Text>
        </div>
        {canCreate && <Button onClick={() => setEditor({ mode: 'create' })}>{t('new')}</Button>}
      </div>

      {announcements.length === 0 ? (
        <Text variant="muted">{t('empty')}</Text>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('announcement')}</TableHead>
              <TableHead>{t('scope')}</TableHead>
              <TableHead>{t('window')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.map((announcement) => {
              const status = getAnnouncementStatus(announcement, now);
              const canWrite = canManageAllSites || announcement.siteId !== null;

              return (
                <TableRow key={announcement.id}>
                  <TableCell>
                    <span>{announcement.titleEn}</span>
                    <span className="text-ink-faint block text-sm">{announcement.titleVi}</span>
                  </TableCell>
                  <TableCell>{announcement.siteName ?? t('allSites')}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {formatInstant(announcement.startsAt)}
                    <span className="block">
                      {announcement.endsAt
                        ? t('until', { date: formatInstant(announcement.endsAt) })
                        : t('noEnd')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[status]}>{t(`statuses.${status}`)}</Badge>
                  </TableCell>
                  <TableCell>
                    {canWrite && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditor({ mode: 'edit', announcement })}
                        >
                          {t('edit')}
                        </Button>
                        {confirmingId === announcement.id ? (
                          <>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => remove(announcement)}
                            >
                              {t('confirmDelete')}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setConfirmingId(null)}>
                              {t('cancelDelete')}
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmingId(announcement.id)}
                          >
                            {t('delete')}
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Dialog open={editor !== null} onOpenChange={(open) => !open && setEditor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editor?.mode === 'edit' ? t('editTitle') : t('createTitle')}</DialogTitle>
          </DialogHeader>
          {editor && (
            <AnnouncementForm
              announcement={editor.mode === 'edit' ? editor.announcement : undefined}
              siteOptions={formSiteOptions}
              defaultSiteId={defaultSiteId ?? ALL_SITES}
              onDone={() => setEditor(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
