import { AdminDirectory } from '@/components/admin/AdminDirectory';
import { requireRoles } from '@/lib/auth/guards';

const AdminCoursesPage = async () => {
  await requireRoles(['instructor', 'admin']);

  return <AdminDirectory kind="courses" />;
};

export default AdminCoursesPage;
