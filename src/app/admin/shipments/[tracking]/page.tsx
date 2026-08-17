import { ShipmentDetail } from '@/components/admin/ShipmentDetail';

const AdminShipmentDetailPage = async ({ params }: { params: Promise<{ tracking: string }> }) => {
  const { tracking } = await params;

  return <ShipmentDetail tracking={tracking} />;
};

export default AdminShipmentDetailPage;
