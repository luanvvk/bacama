import { CatalogBrowser } from '@/components/admin/CatalogBrowser';
import { requireRoles } from '@/lib/auth/guards';

const AdminCatalogPage = async () => {
  await requireRoles(['staff', 'admin']);

  return (
    <CatalogBrowser
      title="Coffee & blends"
      description="Price, stock and roast date for every coffee product. Changes are preview-only until a catalogue service is connected."
      filter="all"
      newLabel="New product"
    />
  );
};

export default AdminCatalogPage;
