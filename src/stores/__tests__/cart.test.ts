import { act, renderHook } from '@testing-library/react';

import { useCartStore, useCartCount, useCartTotalVnd } from '../cart';

const CROISSANT = { id: 'croissant', name: 'Croissant', priceVnd: 45000 };
const BAGUETTE = { id: 'baguette', name: 'Baguette', priceVnd: 55000 };

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

  it('clears all items', () => {
    act(() => {
      useCartStore.getState().addItem(CROISSANT);
      useCartStore.getState().addItem(BAGUETTE);
      useCartStore.getState().clearCart();
    });

    expect(useCartStore.getState().items).toEqual([]);
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

describe('useCartTotalVnd', () => {
  it('sums price * quantity across items', () => {
    act(() => {
      useCartStore.getState().addItem(CROISSANT, 2);
      useCartStore.getState().addItem(BAGUETTE, 1);
    });

    const { result } = renderHook(() => useCartTotalVnd());
    expect(result.current).toBe(CROISSANT.priceVnd * 2 + BAGUETTE.priceVnd);
  });
});

describe('useCartStore quantity bounds and persistence', () => {
  it('clamps quantity to an integer between 1 and 20', () => {
    act(() => {
      useCartStore.getState().addItem(CROISSANT, 98);
      useCartStore.getState().addItem(CROISSANT, 5);
    });
    expect(useCartStore.getState().items[0].quantity).toBe(20);

    act(() => useCartStore.getState().updateQuantity('croissant', 0));
    expect(useCartStore.getState().items[0].quantity).toBe(1);
    act(() => useCartStore.getState().updateQuantity('croissant', -4));
    expect(useCartStore.getState().items[0].quantity).toBe(1);
    act(() => useCartStore.getState().updateQuantity('croissant', NaN));
    expect(useCartStore.getState().items[0].quantity).toBe(1);
    act(() => useCartStore.getState().updateQuantity('croissant', 2.7));
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('persists items (not isOpen) and restores them on rehydrate', async () => {
    act(() => {
      useCartStore.getState().addItem(CROISSANT, 2);
      useCartStore.getState().open();
    });
    const saved = JSON.parse(localStorage.getItem('bacama-cart-v1') as string);
    expect(saved.state).toEqual({ items: [{ ...CROISSANT, quantity: 2 }] });

    useCartStore.setState({ items: [] });
    localStorage.setItem('bacama-cart-v1', JSON.stringify(saved));
    await useCartStore.persist.rehydrate();
    expect(useCartStore.getState().items).toEqual([{ ...CROISSANT, quantity: 2 }]);
  });

  it('clamps quantities restored from storage', async () => {
    localStorage.setItem(
      'bacama-cart-v1',
      JSON.stringify({ state: { items: [{ ...CROISSANT, quantity: 500 }] }, version: 1 }),
    );
    await useCartStore.persist.rehydrate();
    expect(useCartStore.getState().items[0].quantity).toBe(20);
  });
});
