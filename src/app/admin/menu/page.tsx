import { getTranslations } from 'next-intl/server';

import { Text } from '@/components/ui/Typography';
import { requireRoles } from '@/lib/auth/guards';
import { getAdminMenuItems } from '@/services/catalog/get-admin-menu-items';
import { getSites } from '@/services/sites/get-sites';

import { MenuItemsManager } from './_components/MenuItemsManager';

const AdminMenuPage = async () => {
  const user = await requireRoles(['staff', 'admin']);

  if (user.role !== 'admin' && !user.homeSiteId) {
    const t = await getTranslations('Admin.menu');
    return <Text variant="muted">{t('noSite')}</Text>;
  }

  const [items, sites] = await Promise.all([
    getAdminMenuItems(user),
    user.role === 'admin' ? getSites() : Promise.resolve(null),
  ]);

  return (
    <MenuItemsManager
      items={items}
      siteOptions={sites?.map((site) => ({ value: site.id, label: site.name }))}
      defaultSiteId={user.homeSiteId}
    />
  );
};

export default AdminMenuPage;
