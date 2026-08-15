import { OrderDetail } from '@/components/admin/OrderDetail';

const AdminOrderDetailPage = async ({ params }: { params: Promise<{ ref: string }> }) => {
  const { ref } = await params;

  return <OrderDetail reference={`#${ref}`} />;
};

export default AdminOrderDetailPage;
