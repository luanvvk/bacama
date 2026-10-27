import { requireRoles } from '@/lib/auth/guards';
import { getAdminStaff } from '@/services/users/get-admin-staff';

import { StaffDirectory } from './_components/StaffDirectory';

const AdminStaffPage = async () => {
  await requireRoles(['admin']);
  const { items, nextCursor } = await getAdminStaff();

  return <StaffDirectory staff={items} nextCursor={nextCursor} />;
};

export default AdminStaffPage;
