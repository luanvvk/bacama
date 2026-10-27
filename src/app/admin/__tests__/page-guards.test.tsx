import { requireRoles } from '@/lib/auth/guards';
import { getAdminAnnouncements } from '@/services/sites/get-admin-announcements';
import { getAdminMenuItems } from '@/services/catalog/get-admin-menu-items';
import { getAdminStudents } from '@/services/enrollments/get-admin-students';
import { getSites } from '@/services/sites/get-sites';
import { getAdminStaff } from '@/services/users/get-admin-staff';

import AdminAnnouncementsPage from '../announcements/page';
import AdminCatalogPage from '../catalog/page';
import AdminCoursesPage from '../courses/page';
import AdminMenuPage from '../menu/page';
import AdminSitesPage from '../sites/page';
import AdminStaffPage from '../staff/page';
import AdminStudentsPage from '../students/page';

jest.mock('@/lib/auth/guards', () => ({
  requireRoles: jest.fn(),
}));

jest.mock('@/components/admin/ProductsBrowser', () => ({ ProductsBrowser: () => null }));
jest.mock('@/services/catalog/get-admin-products', () => ({ getAdminProducts: jest.fn() }));
jest.mock('next-intl/server', () => ({ getTranslations: jest.fn() }));
jest.mock('@/services/catalog/get-admin-menu-items', () => ({ getAdminMenuItems: jest.fn() }));
jest.mock('@/services/sites/get-admin-announcements', () => ({
  getAdminAnnouncements: jest.fn(),
}));
jest.mock('../announcements/_components/AnnouncementsManager', () => ({
  AnnouncementsManager: () => null,
}));
jest.mock('@/services/sites/get-sites', () => ({ getSites: jest.fn() }));
jest.mock('../menu/_components/MenuItemsManager', () => ({ MenuItemsManager: () => null }));

jest.mock('@/services/enrollments/get-admin-students', () => ({ getAdminStudents: jest.fn() }));
jest.mock('@/services/users/get-admin-staff', () => ({ getAdminStaff: jest.fn() }));
jest.mock('../students/_components/StudentsDirectory', () => ({ StudentsDirectory: () => null }));
jest.mock('../staff/_components/StaffDirectory', () => ({ StaffDirectory: () => null }));

jest.mock('@/components/admin/CatalogBrowser', () => ({ CatalogBrowser: () => null }));
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
    (getAdminAnnouncements as jest.Mock).mockResolvedValue([]);

    await AdminAnnouncementsPage();

    expect(requireRoles).toHaveBeenCalledWith(['staff', 'admin']);
  });

  it('limits sites to admin', async () => {
    await AdminSitesPage();

    expect(requireRoles).toHaveBeenCalledWith(['admin']);
  });

  it('limits students to admin', async () => {
    (getAdminStudents as jest.Mock).mockResolvedValue({ students: [], total: 0 });

    await AdminStudentsPage();

    expect(requireRoles).toHaveBeenCalledWith(['admin']);
  });

  it('limits staff to admin', async () => {
    (getAdminStaff as jest.Mock).mockResolvedValue([]);

    await AdminStaffPage();

    expect(requireRoles).toHaveBeenCalledWith(['admin']);
  });

  it('limits courses to instructor and admin', async () => {
    await AdminCoursesPage();

    expect(requireRoles).toHaveBeenCalledWith(['instructor', 'admin']);
  });
});
