import { notFound } from 'next/navigation';

import { ShipmentDetail } from '@/components/admin/ShipmentDetail';
import { requireRoles } from '@/lib/auth/guards';
import { getAdminShipment } from '@/services/orders/admin-shipments';

const AdminShipmentDetailPage = async ({ params }: { params: Promise<{ tracking: string }> }) => {
  const user = await requireRoles(['staff', 'admin']);
  const { tracking } = await params;
  const shipment = await getAdminShipment(user, decodeURIComponent(tracking));
  if (!shipment) notFound();

  return <ShipmentDetail shipment={shipment} />;
};

export default AdminShipmentDetailPage;
