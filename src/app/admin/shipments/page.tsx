import { ShipmentsTable } from '@/components/admin/ShipmentsTable';
import { requireRoles } from '@/lib/auth/guards';

const AdminShipmentsPage = async () => {
  await requireRoles(['staff', 'admin']);

  return <ShipmentsTable />;
};

export default AdminShipmentsPage;
