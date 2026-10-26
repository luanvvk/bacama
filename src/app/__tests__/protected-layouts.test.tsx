import { getAuthProvider } from '@/lib/providers/auth';

import AccountLayout from '../(storefront)/account/layout';
import MeLayout from '../(storefront)/me/layout';
import AdminLayout from '../admin/layout';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('not-found');
  }),
  redirect: jest.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/components/admin/AdminSidebar', () => ({ AdminSidebar: () => null }));
jest.mock('@/components/admin/AdminTopbar', () => ({ AdminTopbar: () => null }));

const provider = { getCurrentUser: jest.fn(), requireRole: jest.fn() };

const customer = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  role: 'customer' as const,
  preferredLocale: 'vi' as const,
  homeSiteId: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getAuthProvider).mockReturnValue(provider);
});

describe.each([
  ['me', MeLayout],
  ['account', AccountLayout],
  ['admin', AdminLayout],
])('%s layout', (_name, Layout) => {
  it('redirects a guest to /login', async () => {
    provider.getCurrentUser.mockResolvedValue(null);

    await expect(Layout({ children: null })).rejects.toThrow('redirect:/login');
  });
});

describe('admin layout', () => {
  it('masks a customer as not found', async () => {
    provider.getCurrentUser.mockResolvedValue(customer);

    await expect(AdminLayout({ children: null })).rejects.toThrow('not-found');
  });
});
