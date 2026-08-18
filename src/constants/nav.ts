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

// Fallback content for the Coffee/Bakery columns when no real data is passed
// in (e.g. component tests) — see `buildNavItems`. Real page requests get the
// live top products/bakery items via the (storefront) layout instead.
const DEFAULT_COFFEE_LINKS: NavLink[] = [
  { label: '250g Bag · 100% Arabica', href: '/product/bag-arabica-250g' },
  { label: '250g Bag · 100% Robusta', href: '/product/bag-robusta-250g' },
];
const DEFAULT_BAKERY_LINKS: NavLink[] = [
  { label: 'Sunshine Croissant (Salted Egg)', href: '/bakery' },
  { label: 'Carrot Cake', href: '/bakery' },
];

const STATIC_NAV_ITEMS: NavItem[] = [
  { label: 'Menu', href: '/menu' },
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

// Coffee/Bakery are the only columns backed by real catalog data — everything
// else in the mega-menu (Workshops) is still hand-curated copy, unchanged.
export const buildNavItems = (
  coffeeLinks: NavLink[] = DEFAULT_COFFEE_LINKS,
  bakeryLinks: NavLink[] = DEFAULT_BAKERY_LINKS,
): NavItem[] => [
  {
    label: 'Coffee & Bakery',
    href: '/shop',
    columns: [
      {
        heading: 'Coffee',
        links: [...coffeeLinks, { label: 'Shop all coffee', href: '/shop' }],
      },
      {
        heading: 'Bakery',
        links: [...bakeryLinks, { label: 'Shop all bakery', href: '/bakery' }],
      },
    ],
  },
  ...STATIC_NAV_ITEMS,
];

export const NAV_ITEMS: NavItem[] = buildNavItems();
