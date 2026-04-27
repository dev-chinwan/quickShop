'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Minus, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/context/CartContext';
import { formatPrice, cn } from '@/lib/utils';

export default function ProductCard({ product }) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const qty = getItemQuantity(product.id);
  const [imgError, setImgError] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart`, {
      icon: '🛒',
    });
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    updateQuantity(product.id, qty + 1);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    updateQuantity(product.id, qty - 1);
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className={cn(
        'product-card relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 cursor-pointer',
        !product.inStock && 'opacity-60'
      )}>
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden">
          {!imgError ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🛒</div>
          )}

          {/* Discount badge */}
          {product.discount > 0 && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{product.discount}%
            </div>
          )}

          {/* Custom badge */}
          {product.badge && (
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded-lg text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700">
              {product.badge}
            </div>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-950/60 flex items-center justify-center">
              <span className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-3">
          {/* Rating */}
          <div className="flex items-center gap-1 mb-1.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{product.rating}</span>
            <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{product.reviews} reviews</span>
          </div>

          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{product.unit}</p>

          {/* Price + Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-base font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {product.discount > 0 && (
                <span className="text-xs text-gray-400 line-through ml-1.5">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {product.inStock && (
              qty === 0 ? (
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-all active:scale-95 shadow-md shadow-green-500/25"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 rounded-xl p-0.5">
                  <button
                    onClick={handleDecrement}
                    className="w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm text-green-600 dark:text-green-400 hover:bg-green-500 hover:text-white transition-all active:scale-90"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-bold text-green-700 dark:text-green-300 w-4 text-center">{qty}</span>
                  <button
                    onClick={handleIncrement}
                    className="w-7 h-7 flex items-center justify-center bg-green-500 rounded-lg text-white hover:bg-green-600 transition-all active:scale-90"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
