import { notFound, redirect } from 'next/navigation';

import { getAuthProvider } from '@/lib/providers/auth';

import { requireRoles, requireUser } from '../guards';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('not-found');
  }),
  redirect: jest.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

jest.mock('@/lib/providers/auth', () => ({
  getAuthProvider: jest.fn(),
}));

const user = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  role: 'customer' as const,
  preferredLocale: 'vi' as const,
  homeSiteId: null,
};

const provider = {
  getCurrentUser: jest.fn(),
  requireRole: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getAuthProvider).mockReturnValue(provider);
});

describe('requireUser', () => {
  it('returns the current user', async () => {
    provider.getCurrentUser.mockResolvedValue(user);

    await expect(requireUser()).resolves.toEqual(user);
  });

  it('redirects guests to login', async () => {
    provider.getCurrentUser.mockResolvedValue(null);

    await expect(requireUser()).rejects.toThrow('redirect:/login');
    expect(redirect).toHaveBeenCalledWith('/login');
  });
});

describe('requireRoles', () => {
  it('allows an explicitly permitted role', async () => {
    provider.getCurrentUser.mockResolvedValue({ ...user, role: 'staff' });

    await expect(requireRoles(['staff', 'admin'])).resolves.toMatchObject({ role: 'staff' });
  });

  it('masks unauthorized roles as not found', async () => {
    provider.getCurrentUser.mockResolvedValue(user);

    await expect(requireRoles(['staff', 'admin'])).rejects.toThrow('not-found');
    expect(notFound).toHaveBeenCalled();
  });
});
