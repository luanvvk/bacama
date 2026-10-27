import { ProductsBrowser } from '@/components/admin/ProductsBrowser';
import { requireRoles } from '@/lib/auth/guards';
import { getAdminProducts } from '@/services/catalog/get-admin-products';

const AdminCatalogPage = async () => {
  await requireRoles(['staff', 'admin']);
  const products = await getAdminProducts();

  return <ProductsBrowser products={products} />;
};

export default AdminCatalogPage;
