import { cache } from 'react';
import { auth, currentUser } from '@clerk/nextjs/server';

import { prisma } from '@/lib/prisma';

import type { AuthProvider, AuthUser, Role } from './types';

type DbUser = NonNullable<Awaited<ReturnType<typeof prisma.user.findUnique>>>;

const toAuthUser = (user: DbUser): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  preferredLocale: user.preferredLocale === 'en' ? 'en' : 'vi',
  homeSiteId: user.homeSiteId,
});

// The Clerk webhook normally creates the row; this covers a missed delivery.
// Role and homeSiteId are never read from Clerk: new rows are always customers.
const createMissingUser = async (clerkId: string): Promise<DbUser | null> => {
  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;

  if (!clerkUser || !email) return null;

  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ').trim() || email;

  try {
    return await prisma.user.upsert({
      where: { clerkId },
      create: { clerkId, email, name, role: 'customer', preferredLocale: 'vi' },
      update: {},
    });
  } catch (error) {
    // A concurrent request created the row between our lookup and upsert.
    if ((error as { code?: string }).code === 'P2002') {
      return prisma.user.findUnique({ where: { clerkId } });
    }
    throw error;
  }
};

const findOrCreateUser = async (clerkId: string): Promise<AuthUser | null> => {
  const user =
    (await prisma.user.findUnique({ where: { clerkId } })) ?? (await createMissingUser(clerkId));

  return user ? toAuthUser(user) : null;
};

// Layouts and pages down the same tree both call this to guard + read the
// user — cache() dedupes those into one auth() + Prisma lookup per request.
const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const { userId } = await auth();

  if (!userId) return null;

  return findOrCreateUser(userId);
});

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
