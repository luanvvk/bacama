import { CatalogBrowser } from '@/components/admin/CatalogBrowser';

const AdminCatalogPage = () => (
  <CatalogBrowser
    title="Coffee & blends"
    description="Price, stock and roast date for every coffee product. Changes are preview-only until a catalogue service is connected."
    filter="all"
    newLabel="New product"
  />
);

export default AdminCatalogPage;
