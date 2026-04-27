'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, Plus, Minus, Trash2, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CartDrawer({ open, onClose }) {
  const { items, updateQuantity, removeItem, totalPrice, savings } = useCart();
  const drawerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (open && drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleRemove = (item) => {
    removeItem(item.id);
    toast(`${item.name} removed`, { icon: '🗑️' });
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="drawer-overlay absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={drawerRef}
        className="drawer-panel absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-950 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-bold font-ui text-gray-900 dark:text-white">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                {items.length} items
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Delivery badge */}
        {items.length > 0 && (
          <div className="mx-5 mt-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3">
            <Zap className="w-4 h-4 text-green-500 fill-green-500" />
            <span className="text-sm text-green-700 dark:text-green-400 font-medium">
              Delivery in <strong>10 minutes</strong>!
            </span>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
              <p className="text-sm text-gray-400 mb-6">Add some fresh groceries to get started!</p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-all"
              >
                Browse Products
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    sizes="64px"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{item.unit}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-green-400 hover:text-green-500 transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-5 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => handleRemove(item)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 dark:text-gray-600 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 dark:border-gray-800 space-y-3">
            {savings > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Savings</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">-{formatPrice(savings)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-500">
              <span>Delivery fee</span>
              <span className="text-green-600 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <Link
              href="/cart"
              onClick={onClose}
              className="block w-full py-3.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold text-center rounded-2xl transition-all shadow-lg shadow-green-500/25 mt-2"
            >
              Proceed to Checkout →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
