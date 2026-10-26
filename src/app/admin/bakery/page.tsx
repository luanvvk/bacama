import { CatalogBrowser } from '@/components/admin/CatalogBrowser';
import { requireRoles } from '@/lib/auth/guards';

const AdminBakeryPage = async () => {
  await requireRoles(['staff', 'admin']);

  return (
    <CatalogBrowser
      title="Bakery"
      description="Morning bakes and giftable bakery items currently visible in the shop."
      filter="bakery"
      newLabel="New bake"
    />
  );
};

export default AdminBakeryPage;
