import {
  Coffee,
  Croissant,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  MapPin,
  Package,
  Truck,
  UserRound,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  count?: number;
}

export interface AdminNavSection {
  heading: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavSection[] = [
  {
    heading: 'Today',
    items: [
      { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
      { label: 'Online orders', icon: Package, href: '/admin/orders', count: 14 },
      { label: 'Shipments', icon: Truck, href: '/admin/shipments', count: 9 },
    ],
  },
  {
    heading: 'Catalogue',
    items: [
      { label: 'Coffee & blends', icon: Coffee, href: '/admin/catalog' },
      { label: 'Bakery', icon: Croissant, href: '/admin/bakery' },
      { label: 'Café menu', icon: UtensilsCrossed, href: '/admin/menu' },
    ],
  },
  {
    heading: 'Content',
    items: [
      { label: 'Announcements', icon: Megaphone, href: '/admin/announcements' },
      { label: 'Sites', icon: MapPin, href: '/admin/sites', count: 3 },
      { label: 'Courses', icon: GraduationCap, href: '/admin/courses' },
    ],
  },
  {
    heading: 'People',
    items: [
      { label: 'Staff', icon: Users, href: '/admin/staff' },
      { label: 'Students', icon: UserRound, href: '/admin/students' },
    ],
  },
];
