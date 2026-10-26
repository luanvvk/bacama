import { OrdersTable } from '@/components/admin/OrdersTable';
import { requireRoles } from '@/lib/auth/guards';

const AdminOrdersPage = async () => {
  await requireRoles(['staff', 'admin']);

  return <OrdersTable />;
};

export default AdminOrdersPage;
