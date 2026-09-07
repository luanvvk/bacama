import { notFound, redirect } from 'next/navigation';

import { getAuthProvider } from '@/lib/providers/auth';
import type { AuthUser, Role } from '@/lib/providers/auth/types';

export const requireUser = async (): Promise<AuthUser> => {
  const user = await getAuthProvider().getCurrentUser();

  if (!user) redirect('/login');

  return user;
};

export const requireRoles = async (roles: Role | Role[]): Promise<AuthUser> => {
  const user = await requireUser();
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (user.role !== 'admin' && !allowedRoles.includes(user.role)) notFound();

  return user;
};
