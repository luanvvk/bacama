import { render, screen } from '@testing-library/react';

import { getAdminSites, type AdminSite } from '@/services/sites/site-admin';

import AdminSitesPage from '../page';

jest.mock('@/lib/auth/guards', () => ({ requireRoles: jest.fn() }));
jest.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
jest.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}));
jest.mock('@/services/sites/site-admin', () => ({ getAdminSites: jest.fn() }));

const site = (overrides: Partial<AdminSite>): AdminSite => ({
  id: 'site-1',
  slug: 'ngo-quyen',
  nameVi: 'Ngô Quyền',
  nameEn: 'Ngo Quyen',
  addressVi: '27 Ngô Quyền',
  addressEn: '27 Ngo Quyen',
  hoursVi: 'Hằng ngày',
  hoursEn: 'Every day',
  isActive: true,
  todaysRoastProductId: null,
  ...overrides,
});

describe('AdminSitesPage', () => {
  it('lists each site with its status and an edit link', async () => {
    jest.mocked(getAdminSites).mockResolvedValue({
      items: [site({}), site({ id: 'site-2', slug: 'hoi-an', nameEn: 'Hoi An', isActive: false })],
      nextCursor: null,
    });

    render(await AdminSitesPage());

    expect(screen.getByText('Ngo Quyen')).toBeInTheDocument();
    expect(screen.getByText('Hoi An')).toBeInTheDocument();
    expect(screen.getByText('statusActive')).toBeInTheDocument();
    expect(screen.getByText('statusInactive')).toBeInTheDocument();
    const links = screen.getAllByRole('link', { name: 'edit' });
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/admin/sites/ngo-quyen/edit',
      '/admin/sites/hoi-an/edit',
    ]);
  });

  it('shows the empty state when there are no sites', async () => {
    jest.mocked(getAdminSites).mockResolvedValue({ items: [], nextCursor: null });

    render(await AdminSitesPage());

    expect(screen.getByText('empty')).toBeInTheDocument();
  });
});
