import { render } from '@testing-library/react';

import { useCartStore } from '@/stores/cart';

import { CartHydrator } from '..';

afterEach(() => {
  useCartStore.setState({ items: [] });
  localStorage.clear();
});

describe('CartHydrator', () => {
  it('restores the saved cart after mount', () => {
    // setState also writes to storage, so empty the store first and seed storage after.
    useCartStore.setState({ items: [] });
    localStorage.setItem(
      'bacama-cart-v1',
      JSON.stringify({
        state: { items: [{ id: 'croissant', name: 'Croissant', priceVnd: 45000, quantity: 2 }] },
        version: 1,
      }),
    );

    render(<CartHydrator />);

    expect(useCartStore.getState().items).toHaveLength(1);
  });
});
