'use client';

import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/product/ProductCardSkeleton';
import { useFeaturedProducts } from '@/hooks/useProducts';

export default function FeaturedProducts() {
  const { products, loading } = useFeaturedProducts();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">⭐ Essential Picks</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Top-rated staples people buy every week</p>
        </div>
        <Link
          href="/category"
          className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
}
