import { AdminDirectory } from '@/components/admin/AdminDirectory';
import { requireRoles } from '@/lib/auth/guards';

const AdminAnnouncementsPage = async () => {
  await requireRoles(['staff', 'admin']);

  return <AdminDirectory kind="announcements" />;
};

export default AdminAnnouncementsPage;
