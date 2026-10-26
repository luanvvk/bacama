import type { AuthUser, Role } from '@/lib/providers/auth/types';

import { canAccessSite, siteScopeFilter } from '../scoped';

const makeUser = (role: Role, homeSiteId: string | null): AuthUser => ({
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  role,
  preferredLocale: 'vi',
  homeSiteId,
});

describe('canAccessSite', () => {
  it('lets admin access any site', () => {
    expect(canAccessSite(makeUser('admin', null), 'site-a')).toBe(true);
    expect(canAccessSite(makeUser('admin', 'site-b'), 'site-a')).toBe(true);
  });

  it.each<Role>(['staff', 'instructor'])('limits %s to their home site', (role) => {
    expect(canAccessSite(makeUser(role, 'site-a'), 'site-a')).toBe(true);
    expect(canAccessSite(makeUser(role, 'site-a'), 'site-b')).toBe(false);
    expect(canAccessSite(makeUser(role, null), 'site-a')).toBe(false);
  });

  it('denies customers', () => {
    expect(canAccessSite(makeUser('customer', null), 'site-a')).toBe(false);
    expect(canAccessSite(makeUser('customer', 'site-a'), 'site-a')).toBe(false);
  });
});

describe('siteScopeFilter', () => {
  it('is empty for admin', () => {
    expect(siteScopeFilter(makeUser('admin', null))).toEqual({});
    expect(siteScopeFilter(makeUser('admin', 'site-a'))).toEqual({});
  });

  it('scopes staff to their home site', () => {
    expect(siteScopeFilter(makeUser('staff', 'site-a'))).toEqual({ siteId: 'site-a' });
  });

  it('throws for staff without a home site', () => {
    expect(() => siteScopeFilter(makeUser('staff', null))).toThrow();
  });
});
