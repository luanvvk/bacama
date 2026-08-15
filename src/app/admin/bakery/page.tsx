import { CatalogBrowser } from '@/components/admin/CatalogBrowser';

const AdminBakeryPage = () => (
  <CatalogBrowser
    title="Bakery"
    description="Morning bakes and giftable bakery items currently visible in the shop."
    filter="bakery"
    newLabel="New bake"
  />
);

export default AdminBakeryPage;
