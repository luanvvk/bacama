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

// Message-key lookup for the mega-menu copy; `undefined` keeps the English
// defaults (component tests, `NAV_ITEMS`).
export type NavTranslator = (key: string) => string;

// Coffee/Bakery are the only columns backed by real catalog data — everything
// else in the mega-menu (Workshops) is still hand-curated copy, unchanged.
export const buildNavItems = (
  coffeeLinks: NavLink[] = DEFAULT_COFFEE_LINKS,
  bakeryLinks: NavLink[] = DEFAULT_BAKERY_LINKS,
  t?: NavTranslator,
): NavItem[] => {
  const text = (key: string, fallback: string) => t?.(key) ?? fallback;

  return [
    {
      label: text('coffeeBakery', 'Coffee & Bakery'),
      href: '/shop',
      columns: [
        {
          heading: text('coffee', 'Coffee'),
          links: [
            ...coffeeLinks,
            { label: text('shopAllCoffee', 'Shop all coffee'), href: '/shop' },
          ],
        },
        {
          heading: text('bakery', 'Bakery'),
          links: [
            ...bakeryLinks,
            { label: text('shopAllBakery', 'Shop all bakery'), href: '/bakery' },
          ],
        },
      ],
    },
    { label: text('menu', 'Menu'), href: '/menu' },
    {
      label: text('workshops', 'Workshops'),
      href: '/courses',
      columns: [
        {
          heading: text('online', 'Online'),
          links: [
            {
              label: text('baristaFoundations', 'Barista Foundations'),
              href: '/courses',
              description: text('baristaFoundationsMeta', '6 weeks · 24 lessons'),
            },
            {
              label: text('latteArt', 'Latte Art'),
              href: '/courses',
              description: text('latteArtMeta', '9 lessons · first one free'),
            },
            { label: text('cupping', 'Cupping & Origin'), href: '/courses' },
          ],
        },
        {
          heading: text('inPerson', 'In person'),
          links: [
            {
              label: text('viennoiserie', 'Viennoiserie'),
              href: '/courses',
              description: text('viennoiserieMeta', 'Hội An · 3 seats left'),
            },
            { label: text('weekendRoasting', 'Weekend roasting'), href: '/courses' },
            { label: text('classCalendar', 'Class calendar'), href: '/courses' },
          ],
        },
      ],
    },
    { label: text('cafes', 'Cafés'), href: '/#sites' },
    { label: text('family', 'Our family'), href: '/story' },
  ];
};

export const NAV_ITEMS: NavItem[] = buildNavItems();
