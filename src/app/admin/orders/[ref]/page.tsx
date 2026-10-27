import { notFound } from 'next/navigation';

import { OrderDetail } from '@/components/admin/OrderDetail';
import { requireRoles } from '@/lib/auth/guards';
import { getAdminOrder } from '@/services/orders/admin-orders';

const AdminOrderDetailPage = async ({ params }: { params: Promise<{ ref: string }> }) => {
  const user = await requireRoles(['staff', 'admin']);
  const { ref } = await params;
  const order = await getAdminOrder(user, decodeURIComponent(ref));
  if (!order) notFound();

  return <OrderDetail order={order} />;
};

export default AdminOrderDetailPage;
