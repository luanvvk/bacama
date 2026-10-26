import { getAuthProvider } from '@/lib/providers/auth';
import type { AuthUser, Role } from '@/lib/providers/auth/types';

export type ApiGuardResult = { ok: true; user: AuthUser } | { ok: false; response: Response };

export const requireApiRole = async (roles: Role | Role[]): Promise<ApiGuardResult> => {
  const user = await getAuthProvider().getCurrentUser();

  if (!user) {
    return { ok: false, response: Response.json({ error: 'unauthenticated' }, { status: 401 }) };
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (user.role !== 'admin' && !allowedRoles.includes(user.role)) {
    return { ok: false, response: Response.json({ error: 'forbidden' }, { status: 403 }) };
  }

  return { ok: true, user };
};
