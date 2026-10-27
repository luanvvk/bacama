'use client';

import { useEffect } from 'react';

import { useCartStore } from '@/stores/cart';

// The cart store skips automatic hydration so the first client render matches
// the server HTML; restore the saved cart once mounted.
export const CartHydrator = () => {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return null;
};
