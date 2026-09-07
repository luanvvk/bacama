import { auth } from '@clerk/nextjs/server';

import { prisma } from '@/lib/prisma';

import type { AuthProvider, AuthUser, Role } from './types';

const toAuthUser = async (clerkId: string): Promise<AuthUser | null> => {
  const user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    preferredLocale: user.preferredLocale === 'en' ? 'en' : 'vi',
    homeSiteId: user.homeSiteId,
  };
};

const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { userId } = await auth();

  if (!userId) return null;

  return toAuthUser(userId);
};

const requireRole = async (roles: Role | Role[]): Promise<AuthUser> => {
  const user = await getCurrentUser();

  if (!user) throw new Error('Unauthorized');

  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  if (user.role !== 'admin' && !allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }

  return user;
};

export const getClerkAuthProvider = (): AuthProvider => ({
  getCurrentUser,
  requireRole,
});
