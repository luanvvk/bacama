/** @jest-environment node */
import { getAuthProvider } from '@/lib/providers/auth';
import type { Role } from '@/lib/providers/auth/types';

import { requireApiRole } from '../api-guards';

jest.mock('@/lib/providers/auth', () => ({
  getAuthProvider: jest.fn(),
}));

const provider = {
  getCurrentUser: jest.fn(),
  requireRole: jest.fn(),
};

const userWithRole = (role: Role) => ({
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  role,
  preferredLocale: 'vi' as const,
  homeSiteId: null,
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getAuthProvider).mockReturnValue(provider);
});

describe('requireApiRole', () => {
  it('returns a 401 JSON response for a guest', async () => {
    provider.getCurrentUser.mockResolvedValue(null);

    const result = await requireApiRole(['staff']);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(401);
    await expect(result.response.json()).resolves.toEqual({ error: 'unauthenticated' });
  });

  it.each<Role>(['customer', 'instructor'])('returns 403 for %s on a staff route', async (role) => {
    provider.getCurrentUser.mockResolvedValue(userWithRole(role));

    const result = await requireApiRole(['staff']);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(403);
    await expect(result.response.json()).resolves.toEqual({ error: 'forbidden' });
  });

  it('allows a listed role', async () => {
    provider.getCurrentUser.mockResolvedValue(userWithRole('staff'));

    await expect(requireApiRole(['staff'])).resolves.toMatchObject({
      ok: true,
      user: { role: 'staff' },
    });
  });

  it('accepts a single role', async () => {
    provider.getCurrentUser.mockResolvedValue(userWithRole('instructor'));

    await expect(requireApiRole('instructor')).resolves.toMatchObject({ ok: true });
  });

  it('always lets admin through', async () => {
    provider.getCurrentUser.mockResolvedValue(userWithRole('admin'));

    await expect(requireApiRole(['instructor'])).resolves.toMatchObject({ ok: true });
  });
});
