import { BakeryItemsManager } from '@/components/admin/BakeryItemsManager';
import { requireRoles } from '@/lib/auth/guards';
import { siteScopeFilter } from '@/lib/auth/scoped';
import { getAdminBakeryItems } from '@/services/catalog/bakery-item-admin';
import { getSites } from '@/services/sites/get-sites';

const AdminBakeryPage = async () => {
  const user = await requireRoles(['staff', 'admin']);
  const [items, sites] = await Promise.all([
    getAdminBakeryItems(siteScopeFilter(user)),
    getSites('en'),
  ]);
  const lockedSiteId = user.role === 'admin' ? null : user.homeSiteId;

  return (
    <BakeryItemsManager
      items={items}
      sites={sites
        .filter((site) => lockedSiteId === null || site.id === lockedSiteId)
        .map((site) => ({ id: site.id, name: site.name }))}
      lockedSiteId={lockedSiteId}
    />
  );
};

export default AdminBakeryPage;
