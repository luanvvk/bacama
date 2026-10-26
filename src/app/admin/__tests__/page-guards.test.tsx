import { requireRoles } from '@/lib/auth/guards';

import AdminCatalogPage from '../catalog/page';
import AdminCoursesPage from '../courses/page';
import AdminSitesPage from '../sites/page';

jest.mock('@/lib/auth/guards', () => ({
  requireRoles: jest.fn(),
}));

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

  it('limits sites to admin', async () => {
    await AdminSitesPage();

    expect(requireRoles).toHaveBeenCalledWith(['admin']);
  });

  it('limits courses to instructor and admin', async () => {
    await AdminCoursesPage();

    expect(requireRoles).toHaveBeenCalledWith(['instructor', 'admin']);
  });
});
