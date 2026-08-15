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
      { label: 'Announcements', icon: Megaphone },
      { label: 'Sites', icon: MapPin, count: 3 },
      { label: 'Courses', icon: GraduationCap },
    ],
  },
  {
    heading: 'People',
    items: [
      { label: 'Staff', icon: Users },
      { label: 'Students', icon: UserRound, count: 84 },
    ],
  },
];

export interface KpiTile {
  label: string;
  value: string;
  delta: string;
  deltaDirection: 'up' | 'down';
  detail: string;
}

export const KPI_TILES: KpiTile[] = [
  {
    label: 'Online orders',
    value: '14',
    delta: '+3',
    deltaDirection: 'up',
    detail: 'vs yesterday',
  },
  { label: 'Online revenue', value: '4.2 tr ₫', delta: '+11%', deltaDirection: 'up', detail: '' },
  {
    label: 'Awaiting despatch',
    value: '9',
    delta: '',
    deltaDirection: 'up',
    detail: 'GHN collects at 16:00',
  },
  {
    label: 'Course sign-ups',
    value: '6',
    delta: '−2',
    deltaDirection: 'down',
    detail: 'this week',
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

export interface AdminStockItem {
  id: string;
  name: string;
  imageUrl: string;
  detail: string;
  quantity: number;
  low?: boolean;
}

export const STOCK_ITEMS: AdminStockItem[] = [
  {
    id: 'dalat-washed',
    name: 'Đà Lạt Washed',
    imageUrl:
      'https://images.unsplash.com/photo-1559056199-641a5ac471bb?auto=format&fit=crop&w=120&q=70',
    detail: '250 g · roasted 11 Aug',
    quantity: 42,
  },
  {
    id: 'sonla-natural',
    name: 'Sơn La Natural',
    imageUrl:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2084?auto=format&fit=crop&w=120&q=70',
    detail: '250 g · roasted 09 Aug',
    quantity: 6,
    low: true,
  },
  {
    id: 'house-blend',
    name: 'House Blend',
    imageUrl:
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=120&q=70',
    detail: '250 g · roasted 12 Aug',
    quantity: 31,
  },
];

export const LOW_STOCK_ALERT = {
  title: 'Sơn La Natural is running low',
  detail: '6 × 250 g left at Site 01. Roasted 09 Aug (4 days ago).',
};

export interface AdminAnnouncement {
  title: string;
  description: string;
  status: 'Live' | 'Scheduled';
  meta: string;
}

export const ADMIN_ANNOUNCEMENTS: AdminAnnouncement[] = [
  {
    title: 'New batch: Đà Lạt Washed',
    description: 'Out this morning, 10% off 1 kg bags until Sunday.',
    status: 'Live',
    meta: 'All sites · until 17 Aug',
  },
  {
    title: 'Site 03 opens in September',
    description: 'An Thuận — roastery, classroom and garden.',
    status: 'Scheduled',
    meta: 'Starts 1 Sep',
  },
];
