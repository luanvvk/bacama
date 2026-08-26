import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BakeryCard } from '../index';
import { useCartStore } from '@/stores/cart';
import { type BakeryCatalogItem } from '@/services/catalog/get-bakery-items';

const MESSAGES: Record<string, string> = {
  eyebrow: 'Bakery',
  bakedDaily: 'Baked daily',
  orderOnGrabfood: 'Order on GrabFood',
  addToCart: 'Add to cart',
  pickupNote: 'Pickup at Lý Tự Trọng',
};

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => MESSAGES[key],
}));

const item: BakeryCatalogItem = {
  id: 'b1',
  slug: 'sunshine-croissant',
  siteId: 'site-1',
  siteSlug: 'ly-tu-trong',
  name: 'Sunshine Croissant (Salted Egg)',
  description: 'Homemade croissant, creamy egg custard, chicken floss, salted egg yolk.',
  imageUrl: 'https://huawei-food-cms.grab.com/example.webp',
  priceVnd: 75000,
  bakesAt: 'Hằng ngày',
  sellOutBy: null,
  handoff: 'pickup',
  handoffUrl: null,
};

afterEach(() => {
  useCartStore.setState({ items: [], isOpen: false });
});

describe('BakeryCard', () => {
  it('renders the item name, description, and price', () => {
    render(<BakeryCard item={item} />);

    expect(screen.getByRole('heading', { name: item.name })).toBeInTheDocument();
    expect(screen.getByText(item.description)).toBeInTheDocument();
    expect(screen.getByText('75.000 ₫')).toBeInTheDocument();
  });

  it('translates the known bakesAt value into an English badge', () => {
    render(<BakeryCard item={item} />);

    expect(screen.getByText('Baked daily')).toBeInTheDocument();
  });

  it('adds the item to the cart and opens the drawer', async () => {
    const user = userEvent.setup();
    render(<BakeryCard item={item} />);

    await user.click(screen.getByRole('button', { name: 'Add to cart' }));

    expect(useCartStore.getState().items).toEqual([
      {
        id: 'b1',
        name: item.name,
        priceVnd: 75000,
        imageUrl: item.imageUrl,
        kind: 'bakery',
        quantity: 1,
      },
    ]);
    expect(useCartStore.getState().isOpen).toBe(true);
  });

  it('links out to GrabFood instead of adding to cart when handoff is grabfood', () => {
    render(
      <BakeryCard
        item={{ ...item, handoff: 'grabfood', handoffUrl: 'https://food.grab.com/example' }}
      />,
    );

    expect(screen.getByRole('link', { name: 'Order on GrabFood' })).toHaveAttribute(
      'href',
      'https://food.grab.com/example',
    );
    expect(screen.queryByRole('button', { name: 'Add to cart' })).not.toBeInTheDocument();
  });
});
