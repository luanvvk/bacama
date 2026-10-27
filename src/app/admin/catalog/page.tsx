import { ProductsBrowser } from '@/components/admin/ProductsBrowser';
import { requireRoles } from '@/lib/auth/guards';
import { getAdminProductsPage } from '@/services/catalog/get-admin-products';

const AdminCatalogPage = async () => {
  await requireRoles(['staff', 'admin']);
  const { items, nextCursor } = await getAdminProductsPage();

  return <ProductsBrowser products={items} nextCursor={nextCursor} />;
};

export default AdminCatalogPage;
