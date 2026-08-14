# Pattern: Zustand store

Real, current sample — `src/stores/cart.ts`:

```ts
import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  open: () => void;
  close: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  isOpen: false,
  addItem: (item, quantity = 1) =>
    set((state) => {
      const existing = state.items.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return {
          items: state.items.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem,
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity }] };
    }),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((cartItem) => cartItem.id !== id) })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

// Selector hooks for derived values components actually need — keeps each
// component subscribed to only the slice it cares about.
export const useCartCount = () =>
  useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0));
```

## Checklist

- [ ] One store per domain concept (`cart`, not a catch-all `appStore`).
- [ ] State and actions live in the same `create<State>()` call — don't split
      actions into a separate object/hook.
- [ ] Components call `useCartStore((state) => state.items)` (a selector),
      not `useCartStore()` (the whole store) — the latter re-renders on
      every unrelated state change.
- [ ] Export a dedicated selector hook (`useCartCount`, `useCartTotalCents`)
      for any derived value read by more than one component, instead of
      recomputing the same `reduce`/`filter` in each call site.
- [ ] Updates go through `set((state) => ({ ... }))` with the updater form
      when the new value depends on the previous state — never mutate
      `state.items` in place.
- [ ] Tests read/act via `useCartStore.getState()` directly (no need to
      render a component to exercise store logic) and reset state in
      `afterEach` with `useCartStore.setState(initialState)` — stores are
      module-level singletons and leak between tests otherwise.
