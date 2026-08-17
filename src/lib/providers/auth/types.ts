export type Role = 'customer' | 'staff' | 'instructor' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  preferredLocale: 'vi' | 'en';
  homeSiteId: string | null;
}

export interface AuthProvider {
  /** Throws unless the current user's role is in `role`. `admin` always passes. */
  requireRole(role: Role | Role[]): Promise<AuthUser>;
  /** Null for a guest — a guest has no User row, not a `guest` role. */
  getCurrentUser(): Promise<AuthUser | null>;
}
