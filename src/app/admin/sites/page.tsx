import { getTranslations } from 'next-intl/server';

import { requireRoles } from '@/lib/auth/guards';
import { getAdminSites } from '@/services/sites/site-admin';

import { SitesGrid } from './_components/SitesGrid';

const AdminSitesPage = async () => {
  await requireRoles(['admin']);
  const [{ items, nextCursor }, t] = await Promise.all([
    getAdminSites(),
    getTranslations('Admin.sites'),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('description')}</p>
      </div>

      <SitesGrid sites={items} nextCursor={nextCursor} />
    </div>
  );
};

export default AdminSitesPage;
