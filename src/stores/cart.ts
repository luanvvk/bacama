import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  priceVnd: number;
  quantity: number;
  imageUrl?: string;
  options?: string;
  // Absent/'product' = shippable (GHN or pickup). 'bakery'/'menu' items are
  // pickup-only — see CheckoutForm's pickup-forcing logic.
  kind?: 'product' | 'bakery' | 'menu';
  // Products with weight/grind variants use a composite `id`
  // (`${productId}-${weight}-${grind}`) to keep each variant a distinct
  // cart line — productId/weight/grind recover the real DB row and
  // selection for order creation. Absent for bakery/menu (their `id` is
  // already the real DB id) and for variant-less products.
  productId?: string;
  weight?: string;
  grind?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
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
  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map((cartItem) =>
        cartItem.id === id ? { ...cartItem, quantity } : cartItem,
      ),
    })),
  clearCart: () => set({ items: [] }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export const useCartCount = () =>
  useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0));

export const useCartTotalVnd = () =>
  useCartStore((state) =>
    state.items.reduce((total, item) => total + item.priceVnd * item.quantity, 0),
  );
