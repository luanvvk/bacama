import { ShipmentDetail } from '@/components/admin/ShipmentDetail';
import { requireRoles } from '@/lib/auth/guards';

const AdminShipmentDetailPage = async ({ params }: { params: Promise<{ tracking: string }> }) => {
  await requireRoles(['staff', 'admin']);
  const { tracking } = await params;

  return <ShipmentDetail tracking={tracking} />;
};

export default AdminShipmentDetailPage;
