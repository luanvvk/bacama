import { ShipmentsTable } from '@/components/admin/ShipmentsTable';
import { requireRoles } from '@/lib/auth/guards';
import { listAdminShipments, type AdminShipmentFilter } from '@/services/orders/admin-shipments';

const FILTERS: AdminShipmentFilter[] = ['all', 'transit', 'delivered', 'cod'];

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const AdminShipmentsPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const user = await requireRoles(['staff', 'admin']);
  const params = await searchParams;
  const filter = FILTERS.find((value) => value === first(params.filter)) ?? 'all';
  const query = first(params.q)?.trim() ?? '';

  const data = await listAdminShipments(user, { filter, query });

  return <ShipmentsTable data={data} filter={filter} query={query} />;
};

export default AdminShipmentsPage;
