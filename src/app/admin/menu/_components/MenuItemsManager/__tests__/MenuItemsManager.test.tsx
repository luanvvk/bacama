import { render, screen, within } from '@testing-library/react';

import type { AdminMenuItem } from '@/services/catalog/get-admin-menu-items';

import { MenuItemsManager } from '../index';

jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn() }) }));
jest.mock('@/lib/toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) =>
    namespace === 'Menu.sections' ? `section:${key}` : key,
}));

const item = (overrides: Partial<AdminMenuItem>): AdminMenuItem => ({
  id: 'm1',
  siteId: 's1',
  siteName: 'Hanoi',
  section: 'tea',
  nameVi: 'Trà',
  nameEn: 'Tea',
  priceVnd: 40000,
  order: 0,
  isActive: true,
  ...overrides,
});

const items = [
  item({ id: 'm1', section: 'tea', nameEn: 'Tea' }),
  item({ id: 'm2', section: 'espresso', nameEn: 'Espresso', siteName: 'Saigon' }),
  item({ id: 'm3', section: 'espresso', nameEn: 'Doppio', isActive: false }),
];

describe('MenuItemsManager', () => {
  it('groups items under section headings in menu order, including inactive ones', () => {
    render(<MenuItemsManager items={items} defaultSiteId="s1" />);

    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(['section:espresso', 'section:tea']);

    const espresso = within(screen.getByRole('region', { name: 'section:espresso' }));
    expect(espresso.getByText('Espresso')).toBeInTheDocument();
    expect(espresso.getByText('Doppio')).toBeInTheDocument();
    expect(espresso.getByText('inactive')).toBeInTheDocument();
    expect(espresso.getAllByRole('button', { name: 'deactivate' })).toHaveLength(1);
  });

  it('hides the site column for staff', () => {
    render(<MenuItemsManager items={items} defaultSiteId="s1" />);

    expect(screen.queryByText('site')).not.toBeInTheDocument();
  });

  it('shows the site column for admin', () => {
    render(
      <MenuItemsManager
        items={items}
        siteOptions={[{ value: 's1', label: 'Hanoi' }]}
        defaultSiteId={null}
      />,
    );

    expect(screen.getAllByText('site')).toHaveLength(2);
    expect(screen.getByText('Saigon')).toBeInTheDocument();
  });
});
