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

export interface AdminOrderRow {
  ref: string;
  customer: string;
  items: string;
  payment: string;
  totalVnd: number;
  status: string;
  statusVariant: 'success' | 'warning' | 'destructive';
}

export const TODAYS_ORDERS: AdminOrderRow[] = [
  {
    ref: '#2418',
    customer: 'Lê Thị Ngọc',
    items: 'Đà Lạt Washed 1 kg',
    payment: 'ZaloPay',
    totalVnd: 780000,
    status: 'Paid',
    statusVariant: 'success',
  },
  {
    ref: '#2417',
    customer: 'Trần Đức Khôi',
    items: 'House Blend 250 g × 2',
    payment: 'MoMo',
    totalVnd: 460000,
    status: 'Shipped',
    statusVariant: 'success',
  },
  {
    ref: '#2416',
    customer: 'Nguyễn Thu Hà',
    items: 'Three Origins Box',
    payment: 'COD',
    totalVnd: 720000,
    status: 'Awaiting COD',
    statusVariant: 'warning',
  },
  {
    ref: '#2415',
    customer: 'Phạm Minh Anh',
    items: 'Latte Art (course)',
    payment: 'ZaloPay',
    totalVnd: 790000,
    status: 'Enrolled',
    statusVariant: 'success',
  },
  {
    ref: '#2414',
    customer: 'Oliver Brandt',
    items: 'Sơn La Natural 250 g',
    payment: 'Visa',
    totalVnd: 265000,
    status: 'Payment failed',
    statusVariant: 'destructive',
  },
];
