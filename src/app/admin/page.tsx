import { getLocale, getTranslations } from 'next-intl/server';

import { requireRoles } from '@/lib/auth/guards';
import { listTodaysOrders } from '@/services/orders/admin-orders';
import { getAdminKpis } from '@/services/orders/get-admin-kpis';
import { getAdminAnnouncements } from '@/services/sites/get-admin-announcements';

import { getSiteName } from '@/services/sites/get-site-name';

import { AnnouncementsPanel } from './_components/AnnouncementsPanel';
import { DashboardActions } from './_components/DashboardActions';
import { KpiTiles } from './_components/KpiTiles';
import { LowStockBanner } from './_components/LowStockBanner';
import { StockPanel } from './_components/StockPanel';
import { TodaysOrdersTable } from './_components/TodaysOrdersTable';
import { getAdminProducts } from '@/services/catalog/get-admin-products';

const AdminOverviewPage = async () => {
  const user = await requireRoles(['staff', 'instructor', 'admin']);
  const showAnnouncements =
    user.role === 'admin' || (user.role === 'staff' && Boolean(user.homeSiteId));
  const locale = (await getLocale()) === 'vi' ? 'vi' : 'en';
  const t = await getTranslations('Admin.overview');
  const showKpis = user.role === 'staff' || user.role === 'admin';
  const kpis = showKpis ? await getAdminKpis() : null;
  const siteName =
    user.role !== 'admin' && user.homeSiteId ? await getSiteName(user.homeSiteId, locale) : null;
  const today = new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date());
  const announcements = showAnnouncements ? (await getAdminAnnouncements(user)).slice(0, 3) : null;
  const [products, todaysOrders] = await Promise.all([getAdminProducts(), listTodaysOrders(user)]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            {today} · {siteName ?? t('allSites')}
          </p>
          <h1 className="font-heading mt-2 text-2xl font-semibold">Today at a glance</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Online figures only. Counter sales live in the POS.
          </p>
        </div>
        <DashboardActions />
      </div>

      <LowStockBanner products={products} />
      {kpis && <KpiTiles kpis={kpis} />}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <TodaysOrdersTable orders={todaysOrders} />
        <div className="flex flex-col gap-6">
          <StockPanel products={products} />
          {announcements && <AnnouncementsPanel announcements={announcements} />}
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
