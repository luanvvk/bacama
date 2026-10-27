import { getTranslations } from 'next-intl/server';

import { Text } from '@/components/ui/Typography';
import { requireRoles } from '@/lib/auth/guards';
import { getAdminAnnouncements } from '@/services/sites/get-admin-announcements';
import { getSites } from '@/services/sites/get-sites';

import { AnnouncementsManager } from './_components/AnnouncementsManager';

const AdminAnnouncementsPage = async () => {
  const user = await requireRoles(['staff', 'admin']);

  if (user.role !== 'admin' && !user.homeSiteId) {
    const t = await getTranslations('Admin.announcements');
    return <Text variant="muted">{t('noSite')}</Text>;
  }

  const [announcements, sites] = await Promise.all([
    getAdminAnnouncements(user),
    user.role === 'admin' ? getSites('en') : Promise.resolve(null),
  ]);

  return (
    <AnnouncementsManager
      announcements={announcements}
      siteOptions={sites?.map((site) => ({ value: site.id, label: site.name }))}
      defaultSiteId={user.homeSiteId}
      canManageAllSites={user.role === 'admin'}
    />
  );
};

export default AdminAnnouncementsPage;
