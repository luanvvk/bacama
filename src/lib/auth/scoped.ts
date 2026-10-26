import type { AuthUser } from '@/lib/providers/auth/types';

export const canAccessSite = (user: AuthUser, siteId: string): boolean => {
  if (user.role === 'admin') return true;
  if (user.role === 'staff' || user.role === 'instructor') return user.homeSiteId === siteId;

  return false;
};

export const siteScopeFilter = (user: AuthUser): { siteId?: string } => {
  if (user.role === 'admin') return {};
  if (user.role === 'customer' || !user.homeSiteId) throw new Error('User cannot be site-scoped');

  return { siteId: user.homeSiteId };
};
