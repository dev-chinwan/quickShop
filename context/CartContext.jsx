'use client';

import { createContext, useContext } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeCartItem = (item) => {
  const price = toNumber(item?.price, 0);
  const quantity = Math.max(1, toNumber(item?.quantity ?? item?.qty, 1));
  const originalPrice = toNumber(item?.originalPrice, price);

  return {
    ...item,
    price,
    originalPrice,
    quantity,
    inStock: item?.inStock ?? true,
  };
};

const normalizeItems = (items) => (
  Array.isArray(items)
    ? items.filter((item) => item && item.id != null).map(normalizeCartItem)
    : []
);

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const incoming = normalizeCartItem(product);
        const items = normalizeItems(get().items);
        const existing = items.find((i) => i.id === incoming.id);
        if (existing) {
          const existingQty = toNumber(existing.quantity ?? existing.qty, 0);
          set({
            items: items.map((i) =>
              i.id === incoming.id ? { ...i, quantity: existingQty + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, incoming] });
        }
      },

      removeItem: (id) => {
        set({ items: normalizeItems(get().items).filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        const nextQuantity = toNumber(quantity, 0);
        if (nextQuantity <= 0) {
          set({ items: normalizeItems(get().items).filter((i) => i.id !== id) });
          return;
        }
        set({
          items: normalizeItems(get().items).map((i) =>
            i.id === id ? { ...i, quantity: nextQuantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getItemQuantity: (id) => {
        const item = normalizeItems(get().items).find((i) => i.id === id);
        return item ? toNumber(item.quantity ?? item.qty, 0) : 0;
      },

      get totalItems() {
        return normalizeItems(get().items).reduce((sum, i) => sum + toNumber(i.quantity ?? i.qty, 0), 0);
      },

      get totalPrice() {
        return normalizeItems(get().items).reduce((sum, i) => {
          const price = toNumber(i.price, 0);
          const quantity = toNumber(i.quantity ?? i.qty, 0);
          return sum + (price * quantity);
        }, 0);
      },

      get savings() {
        return normalizeItems(get().items).reduce((sum, i) => {
          const originalPrice = toNumber(i.originalPrice, toNumber(i.price, 0));
          const price = toNumber(i.price, 0);
          const quantity = toNumber(i.quantity ?? i.qty, 0);
          const saved = (originalPrice - price) * quantity;
          return sum + (saved > 0 ? saved : 0);
        }, 0);
      },
    }),
    {
      name: 'quickshop-cart',
      version: 2,
      partialize: (state) => ({
        items: normalizeItems(state.items),
      }),
      migrate: (persistedState) => ({
        items: normalizeItems(persistedState?.items),
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        items: normalizeItems(persistedState?.items ?? currentState.items),
      }),
    }
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
