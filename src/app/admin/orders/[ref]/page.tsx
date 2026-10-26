import { OrderDetail } from '@/components/admin/OrderDetail';
import { requireRoles } from '@/lib/auth/guards';

const AdminOrderDetailPage = async ({ params }: { params: Promise<{ ref: string }> }) => {
  await requireRoles(['staff', 'admin']);
  const { ref } = await params;

  return <OrderDetail reference={`#${ref}`} />;
};

export default AdminOrderDetailPage;
