import { AdminDirectory } from '@/components/admin/AdminDirectory';
import { requireRoles } from '@/lib/auth/guards';

const AdminStaffPage = async () => {
  await requireRoles(['admin']);

  return <AdminDirectory kind="staff" />;
};

export default AdminStaffPage;
