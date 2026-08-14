export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavColumn {
  heading: string;
  links: NavLink[];
}

export interface NavItem {
  label: string;
  href: string;
  columns?: NavColumn[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Coffee & Bakery',
    href: '/shop',
    columns: [
      {
        heading: 'Coffee',
        links: [
          {
            label: 'Đà Lạt Washed',
            href: '/product/dalat-washed',
            description: 'Medium · plum, honey',
          },
          {
            label: 'Sơn La Natural',
            href: '/product/son-la-natural',
            description: 'Dark · cocoa, malt',
          },
          {
            label: 'House Blend',
            href: '/product/house-blend',
            description: 'For phin and espresso',
          },
          { label: '1 kg wholesale bags', href: '/shop' },
        ],
      },
      {
        heading: 'Bakery',
        links: [
          { label: 'Croissant', href: '/shop', description: 'Plain, almond, chocolate' },
          { label: 'Kouign-amann', href: '/shop' },
          { label: 'Carrot cake', href: '/shop' },
          { label: 'Order a whole cake', href: '/shop' },
        ],
      },
    ],
  },
  {
    label: 'Workshops',
    href: '/courses',
    columns: [
      {
        heading: 'Online',
        links: [
          { label: 'Barista Foundations', href: '/courses', description: '6 weeks · 24 lessons' },
          { label: 'Latte Art', href: '/courses', description: '9 lessons · first one free' },
          { label: 'Cupping & Origin', href: '/courses' },
        ],
      },
      {
        heading: 'In person',
        links: [
          { label: 'Viennoiserie', href: '/courses', description: 'Hội An · 3 seats left' },
          { label: 'Weekend roasting', href: '/courses' },
          { label: 'Class calendar', href: '/courses' },
        ],
      },
    ],
  },
  { label: 'Cafés', href: '/#sites' },
  { label: 'Our family', href: '/story' },
];
