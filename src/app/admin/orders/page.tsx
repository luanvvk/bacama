import { OrdersTable } from '@/components/admin/OrdersTable';
import { requireRoles } from '@/lib/auth/guards';
import { listAdminOrders, type AdminOrderFilter } from '@/services/orders/admin-orders';

const FILTERS: AdminOrderFilter[] = ['all', 'ack', 'cod', 'failed'];

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const AdminOrdersPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const user = await requireRoles(['staff', 'admin']);
  const params = await searchParams;
  const filter = FILTERS.find((value) => value === first(params.filter)) ?? 'all';
  const query = first(params.q)?.trim() ?? '';
  const page = Number.parseInt(first(params.page) ?? '1', 10);

  const data = await listAdminOrders(user, {
    page: Number.isFinite(page) ? page : 1,
    filter,
    query,
  });

  return <OrdersTable data={data} filter={filter} query={query} />;
};

export default AdminOrdersPage;
