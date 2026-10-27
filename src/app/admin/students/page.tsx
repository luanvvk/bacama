import { requireRoles } from '@/lib/auth/guards';
import { getAdminStudents } from '@/services/enrollments/get-admin-students';

import { StudentsDirectory } from './_components/StudentsDirectory';

const AdminStudentsPage = async () => {
  await requireRoles(['admin']);
  const { students, total } = await getAdminStudents();

  return <StudentsDirectory students={students} total={total} />;
};

export default AdminStudentsPage;
