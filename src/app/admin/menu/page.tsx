import { CatalogBrowser } from '@/components/admin/CatalogBrowser';

const AdminMenuPage = () => (
  <CatalogBrowser
    title="Café menu"
    description="The same product catalogue powers the café menu preview. Menu pricing and availability are not persisted yet."
    filter="all"
    newLabel="New menu item"
  />
);

export default AdminMenuPage;
