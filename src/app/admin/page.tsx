import { requireRoles } from '@/lib/auth/guards';
import { getAdminAnnouncements } from '@/services/sites/get-admin-announcements';

import { AnnouncementsPanel } from './_components/AnnouncementsPanel';
import { DashboardActions } from './_components/DashboardActions';
import { KpiTiles } from './_components/KpiTiles';
import { LowStockBanner } from './_components/LowStockBanner';
import { StockPanel } from './_components/StockPanel';
import { TodaysOrdersTable } from './_components/TodaysOrdersTable';

const AdminOverviewPage = async () => {
  const user = await requireRoles(['staff', 'instructor', 'admin']);
  const showAnnouncements =
    user.role === 'admin' || (user.role === 'staff' && Boolean(user.homeSiteId));
  const announcements = showAnnouncements ? (await getAdminAnnouncements(user)).slice(0, 3) : null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            Wednesday · 13 Aug 2026 · Site 01 Ngô Quyền
          </p>
          <h1 className="font-heading mt-2 text-2xl font-semibold">Today at a glance</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Online figures only. Counter sales live in the POS.
          </p>
        </div>
        <DashboardActions />
      </div>

      <LowStockBanner />
      <KpiTiles />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <TodaysOrdersTable />
        <div className="flex flex-col gap-6">
          <StockPanel />
          {announcements && <AnnouncementsPanel announcements={announcements} />}
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
