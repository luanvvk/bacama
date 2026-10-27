import { render, screen } from '@testing-library/react';

import AdminOverviewPage from '../page';

const mockRequireRoles = jest.fn();
const mockGetAdminKpis = jest.fn();

jest.mock('@/lib/auth/guards', () => ({
  requireRoles: (...args: unknown[]) => mockRequireRoles(...args),
}));
jest.mock('@/services/orders/admin-orders', () => ({
  listTodaysOrders: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/services/orders/get-admin-kpis', () => ({
  getAdminKpis: () => mockGetAdminKpis(),
}));
jest.mock('@/services/sites/get-admin-announcements', () => ({
  getAdminAnnouncements: jest.fn().mockResolvedValue({ items: [], nextCursor: null }),
}));
jest.mock('@/services/catalog/get-admin-products', () => ({
  getAdminProducts: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/services/sites/get-site-name', () => ({
  getSiteName: jest.fn().mockResolvedValue('Ngô Quyền'),
}));
jest.mock('next-intl/server', () => ({
  getLocale: async () => 'en',
  getTranslations: async () => (key: string) => key,
}));
jest.mock('../_components/KpiTiles', () => ({ KpiTiles: () => <div data-testid="kpi-tiles" /> }));
jest.mock('../_components/DashboardActions', () => ({ DashboardActions: () => null }));
jest.mock('../_components/LowStockBanner', () => ({ LowStockBanner: () => null }));
jest.mock('../_components/StockPanel', () => ({ StockPanel: () => null }));
jest.mock('../_components/TodaysOrdersTable', () => ({ TodaysOrdersTable: () => null }));
jest.mock('../_components/AnnouncementsPanel', () => ({ AnnouncementsPanel: () => null }));

const user = (role: string) => ({ id: 'u1', role, homeSiteId: 's1' });

describe('AdminOverviewPage KPI visibility', () => {
  beforeEach(() => mockGetAdminKpis.mockResolvedValue({}));
  afterEach(() => jest.clearAllMocks());

  it.each(['staff', 'admin'])('shows the tiles to %s', async (role) => {
    mockRequireRoles.mockResolvedValue(user(role));

    render(await AdminOverviewPage());

    expect(screen.getByTestId('kpi-tiles')).toBeInTheDocument();
  });

  it('shows no tiles and runs no KPI query for an instructor', async () => {
    mockRequireRoles.mockResolvedValue(user('instructor'));

    render(await AdminOverviewPage());

    expect(screen.queryByTestId('kpi-tiles')).not.toBeInTheDocument();
    expect(mockGetAdminKpis).not.toHaveBeenCalled();
  });
});
