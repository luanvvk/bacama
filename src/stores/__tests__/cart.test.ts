import { act, renderHook } from '@testing-library/react';

import { useCartStore, useCartCount, useCartTotalCents } from '../cart';

const CROISSANT = { id: 'croissant', name: 'Croissant', priceCents: 350 };
const BAGUETTE = { id: 'baguette', name: 'Baguette', priceCents: 450 };

afterEach(() => {
  useCartStore.setState({ items: [], isOpen: false });
});

describe('useCartStore', () => {
  it('adds a new item with the given quantity', () => {
    act(() => useCartStore.getState().addItem(CROISSANT, 2));

    expect(useCartStore.getState().items).toEqual([{ ...CROISSANT, quantity: 2 }]);
  });

  it('increments quantity when the same item is added again', () => {
    act(() => {
      useCartStore.getState().addItem(CROISSANT);
      useCartStore.getState().addItem(CROISSANT, 2);
    });

    expect(useCartStore.getState().items).toEqual([{ ...CROISSANT, quantity: 3 }]);
  });

  it('removes an item by id', () => {
    act(() => {
      useCartStore.getState().addItem(CROISSANT);
      useCartStore.getState().addItem(BAGUETTE);
      useCartStore.getState().removeItem(CROISSANT.id);
    });

    expect(useCartStore.getState().items).toEqual([{ ...BAGUETTE, quantity: 1 }]);
  });

  it('updates an item quantity', () => {
    act(() => {
      useCartStore.getState().addItem(CROISSANT);
      useCartStore.getState().updateQuantity(CROISSANT.id, 5);
    });

    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('opens and closes the cart drawer', () => {
    act(() => useCartStore.getState().open());
    expect(useCartStore.getState().isOpen).toBe(true);

    act(() => useCartStore.getState().close());
    expect(useCartStore.getState().isOpen).toBe(false);
  });
});

describe('useCartCount', () => {
  it('sums quantities across items', () => {
    act(() => {
      useCartStore.getState().addItem(CROISSANT, 2);
      useCartStore.getState().addItem(BAGUETTE, 3);
    });

    const { result } = renderHook(() => useCartCount());
    expect(result.current).toBe(5);
  });
});

describe('useCartTotalCents', () => {
  it('sums price * quantity across items', () => {
    act(() => {
      useCartStore.getState().addItem(CROISSANT, 2);
      useCartStore.getState().addItem(BAGUETTE, 1);
    });

    const { result } = renderHook(() => useCartTotalCents());
    expect(result.current).toBe(CROISSANT.priceCents * 2 + BAGUETTE.priceCents);
  });
});
