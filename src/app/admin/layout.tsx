import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { requireRoles } from '@/lib/auth/guards';

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  await requireRoles(['staff', 'instructor', 'admin']);

  return (
    <div className="flex min-h-screen flex-col">
      <AdminTopbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="min-w-0 flex-1 overflow-x-hidden p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
