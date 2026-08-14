import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
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
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export const useCartCount = () =>
  useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0));

export const useCartTotalCents = () =>
  useCartStore((state) =>
    state.items.reduce((total, item) => total + item.priceCents * item.quantity, 0),
  );
