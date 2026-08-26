import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MenuSections } from '../index';
import { useCartStore } from '@/stores/cart';
import { type MenuCatalogItem } from '@/services/catalog/get-menu-items';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { name: string }) => {
    if (key === 'addItemLabel') return `Add ${params?.name} to cart`;
    return key === 'add' ? 'Add' : key;
  },
}));

const ESPRESSO: MenuCatalogItem = {
  id: 'm1',
  slug: 'espresso',
  section: 'espresso',
  name: 'Espresso',
  priceVnd: 45000,
};

afterEach(() => {
  useCartStore.setState({ items: [], isOpen: false });
});

describe('MenuSections', () => {
  it('renders each section heading and its items with formatted prices', () => {
    render(
      <MenuSections
        sections={[['espresso', [ESPRESSO]]]}
        sectionLabels={{ espresso: 'Espresso' }}
      />,
    );

    expect(screen.getAllByText('Espresso')).toHaveLength(2);
    expect(screen.getByText('45.000 ₫')).toBeInTheDocument();
  });

  it('adds a drink to the cart as a menu item and opens the drawer', async () => {
    const user = userEvent.setup();
    render(
      <MenuSections
        sections={[['espresso', [ESPRESSO]]]}
        sectionLabels={{ espresso: 'Espresso' }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Add Espresso to cart' }));

    expect(useCartStore.getState().items).toEqual([
      { id: 'm1', name: 'Espresso', priceVnd: 45000, kind: 'menu', quantity: 1 },
    ]);
    expect(useCartStore.getState().isOpen).toBe(true);
  });
});
