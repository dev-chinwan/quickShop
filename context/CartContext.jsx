'use client';

import { createContext, useContext } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const items = get().items;
        const existing = items.find(i => i.id === product.id);
        if (existing) {
          set({
            items: items.map(i =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter(i => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter(i => i.id !== id) });
          return;
        }
        set({
          items: get().items.map(i =>
            i.id === id ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getItemQuantity: (id) => {
        const item = get().items.find(i => i.id === id);
        return item ? item.quantity : 0;
      },

      get totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      get totalPrice() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },

      get savings() {
        return get().items.reduce((sum, i) => {
          const saved = (i.originalPrice - i.price) * i.quantity;
          return sum + (saved > 0 ? saved : 0);
        }, 0);
      },
    }),
    { name: 'quickshop-cart' }
  )
);

const CartContext = createContext(null);

export function CartProvider({ children }) {
  return (
    <CartContext.Provider value={useCartStore}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useCartStore();
}

export default useCartStore;
