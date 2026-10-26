import { AdminDirectory } from '@/components/admin/AdminDirectory';
import { requireRoles } from '@/lib/auth/guards';

const AdminSitesPage = async () => {
  await requireRoles(['admin']);

  return <AdminDirectory kind="sites" />;
};

export default AdminSitesPage;
