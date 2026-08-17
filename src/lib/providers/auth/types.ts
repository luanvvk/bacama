export type Role = 'student' | 'instructor' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  preferredLocale: 'vi' | 'en';
  homeSiteId: string | null;
}

export interface AuthProvider {
  requireRole(role: Role | Role[]): Promise<AuthUser>;
  getCurrentUser(): Promise<AuthUser | null>;
}
