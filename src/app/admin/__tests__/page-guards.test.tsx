import { getTranslations } from 'next-intl/server';

import { requireRoles } from '@/lib/auth/guards';
import { getAdminAnnouncements } from '@/services/sites/get-admin-announcements';
import { getAdminMenuItems } from '@/services/catalog/get-admin-menu-items';
import { getAdminCourses } from '@/services/courses/get-admin-courses';
import { getAdminStudents } from '@/services/enrollments/get-admin-students';
import { getSites } from '@/services/sites/get-sites';
import {
  getActiveProductOptions,
  getAdminSiteBySlug,
  getAdminSites,
} from '@/services/sites/site-admin';
import { getAdminStaff } from '@/services/users/get-admin-staff';

import AdminAnnouncementsPage from '../announcements/page';
import AdminCatalogPage from '../catalog/page';
import AdminCoursesPage from '../courses/page';
import AdminMenuPage from '../menu/page';
import AdminSitesPage from '../sites/page';
import AdminSiteEditPage from '../sites/[slug]/edit/page';
import AdminStaffPage from '../staff/page';
import AdminStudentsPage from '../students/page';

jest.mock('@/lib/auth/guards', () => ({
  requireRoles: jest.fn(),
}));

jest.mock('@/components/admin/ProductsBrowser', () => ({ ProductsBrowser: () => null }));
jest.mock('@/services/catalog/get-admin-products', () => ({
  getAdminProducts: jest.fn(),
  getAdminProductsPage: jest.fn().mockResolvedValue({ items: [], nextCursor: null }),
}));
jest.mock('next-intl/server', () => ({ getTranslations: jest.fn() }));
jest.mock('@/services/catalog/get-admin-menu-items', () => ({ getAdminMenuItems: jest.fn() }));
jest.mock('@/services/sites/get-admin-announcements', () => ({
  getAdminAnnouncements: jest.fn(),
}));
jest.mock('../announcements/_components/AnnouncementsManager', () => ({
  AnnouncementsManager: () => null,
}));
jest.mock('@/services/sites/get-sites', () => ({ getSites: jest.fn() }));
jest.mock('@/services/sites/site-admin', () => ({
  getAdminSites: jest.fn(),
  getAdminSiteBySlug: jest.fn(),
  getActiveProductOptions: jest.fn(),
}));
jest.mock('@/components/admin/SiteEditor', () => ({ SiteEditor: () => null }));
jest.mock('../menu/_components/MenuItemsManager', () => ({ MenuItemsManager: () => null }));

jest.mock('@/services/enrollments/get-admin-students', () => ({ getAdminStudents: jest.fn() }));
jest.mock('@/services/users/get-admin-staff', () => ({ getAdminStaff: jest.fn() }));
jest.mock('../students/_components/StudentsDirectory', () => ({ StudentsDirectory: () => null }));
jest.mock('../staff/_components/StaffDirectory', () => ({ StaffDirectory: () => null }));

jest.mock('@/services/courses/get-admin-courses', () => ({ getAdminCourses: jest.fn() }));
jest.mock('@/components/admin/AdminDirectory', () => ({ AdminDirectory: () => null }));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('admin page guards', () => {
  it('limits the catalog to staff and admin', async () => {
    await AdminCatalogPage();

    expect(requireRoles).toHaveBeenCalledWith(['staff', 'admin']);
  });

  it('limits the menu to staff and admin', async () => {
    jest.mocked(requireRoles).mockResolvedValue({ role: 'admin', homeSiteId: null } as never);
    (getSites as jest.Mock).mockResolvedValue([]);
    (getAdminMenuItems as jest.Mock).mockResolvedValue([]);

    await AdminMenuPage();

    expect(requireRoles).toHaveBeenCalledWith(['staff', 'admin']);
  });

  it('limits announcements to staff and admin', async () => {
    jest.mocked(requireRoles).mockResolvedValue({ role: 'admin', homeSiteId: null } as never);
    (getSites as jest.Mock).mockResolvedValue([]);
    (getAdminAnnouncements as jest.Mock).mockResolvedValue({ items: [], nextCursor: null });

    await AdminAnnouncementsPage();

    expect(requireRoles).toHaveBeenCalledWith(['staff', 'admin']);
  });

  it('limits sites to admin', async () => {
    (getAdminSites as jest.Mock).mockResolvedValue([]);
    (getTranslations as jest.Mock).mockResolvedValue((key: string) => key);

    await AdminSitesPage();

    expect(requireRoles).toHaveBeenCalledWith(['admin']);
  });

  it('limits the site editor to admin', async () => {
    (getAdminSiteBySlug as jest.Mock).mockResolvedValue({ nameEn: 'Ngo Quyen' });
    (getActiveProductOptions as jest.Mock).mockResolvedValue([]);
    (getTranslations as jest.Mock).mockResolvedValue((key: string) => key);

    await AdminSiteEditPage({ params: Promise.resolve({ slug: 'ngo-quyen' }) });

    expect(requireRoles).toHaveBeenCalledWith(['admin']);
  });

  it('limits students to admin', async () => {
    (getAdminStudents as jest.Mock).mockResolvedValue({ students: [], total: 0 });

    await AdminStudentsPage();

    expect(requireRoles).toHaveBeenCalledWith(['admin']);
  });

  it('limits staff to admin', async () => {
    (getAdminStaff as jest.Mock).mockResolvedValue({ items: [], nextCursor: null });

    await AdminStaffPage();

    expect(requireRoles).toHaveBeenCalledWith(['admin']);
  });

  it('limits courses to instructor and admin', async () => {
    jest.mocked(requireRoles).mockResolvedValue({ id: 'u1', role: 'instructor' } as never);
    (getAdminCourses as jest.Mock).mockResolvedValue({ courses: [], students: 0 });

    await AdminCoursesPage();

    expect(requireRoles).toHaveBeenCalledWith(['instructor', 'admin']);
    expect(getAdminCourses).toHaveBeenCalledWith({ id: 'u1', role: 'instructor' });
  });
});
