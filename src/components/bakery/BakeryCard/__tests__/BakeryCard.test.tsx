import { render, screen } from '@testing-library/react';

import { BakeryCard } from '../index';
import { type BakeryCatalogItem } from '@/services/catalog/get-bakery-items';

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
  handoff: 'grabfood',
  handoffUrl: 'https://food.grab.com/vn/vi/restaurant/bacama-coffee-more-delivery/5-C3KEGFM1VGN2N2',
};

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

  it('links out to GrabFood when a handoff URL is set', () => {
    render(<BakeryCard item={item} />);

    expect(screen.getByRole('link', { name: 'Order on GrabFood' })).toHaveAttribute(
      'href',
      item.handoffUrl,
    );
  });

  it('does not render a GrabFood link when no handoff URL is set', () => {
    render(<BakeryCard item={{ ...item, handoffUrl: null }} />);

    expect(screen.queryByRole('link', { name: 'Order on GrabFood' })).not.toBeInTheDocument();
  });
});
