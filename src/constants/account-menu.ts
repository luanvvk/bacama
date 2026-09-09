import { GraduationCap, Package, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react';

export interface AccountMenuItem {
  labelKey: string;
  icon: LucideIcon;
  href: string;
}

export const ACCOUNT_MENU_ITEMS: AccountMenuItem[] = [
  { labelKey: 'profile', icon: UserRound, href: '/account/profile' },
  { labelKey: 'myLearning', icon: GraduationCap, href: '/me' },
  { labelKey: 'myOrders', icon: Package, href: '/account' },
];

export const STAFF_MENU_ITEMS: AccountMenuItem[] = [
  { labelKey: 'teacherConsole', icon: UserRound, href: '/teach' },
  { labelKey: 'adminConsole', icon: ShieldCheck, href: '/admin' },
];
