import { AdminDirectory } from '@/components/admin/AdminDirectory';
import { requireRoles } from '@/lib/auth/guards';
import { getAdminCourses } from '@/services/courses/get-admin-courses';

const AdminCoursesPage = async () => {
  const user = await requireRoles(['instructor', 'admin']);
  const { courses, students } = await getAdminCourses(user);

  return <AdminDirectory courses={courses} students={students} />;
};

export default AdminCoursesPage;
