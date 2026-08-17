import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col">
    <AdminTopbar />
    <div className="flex flex-1">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden p-6">{children}</main>
    </div>
  </div>
);

export default AdminLayout;
