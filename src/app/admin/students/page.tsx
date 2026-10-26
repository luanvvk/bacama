import { AdminDirectory } from '@/components/admin/AdminDirectory';
import { requireRoles } from '@/lib/auth/guards';

const AdminStudentsPage = async () => {
  await requireRoles(['admin']);

  return <AdminDirectory kind="students" />;
};

export default AdminStudentsPage;
