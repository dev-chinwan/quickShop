'use client';

import Link from 'next/link';
import { useCategories } from '@/hooks/useCatalog';

export default function CategoryGrid() {
  const { categories, loading } = useCategories();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Shop Daily Essentials</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Rice, atta, dal, oil, and home care basics</p>
        </div>
        <Link
          href="/category"
          className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="aspect-square rounded-2xl skeleton" />
            ))
          : categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category?category=${cat.id}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-square flex flex-col items-center justify-center gap-2 transition-transform duration-200 group-hover:scale-105 group-hover:shadow-lg cursor-pointer">
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity`} />
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-5`} />
                  <div className={`w-full h-full bg-gradient-to-br ${cat.color} opacity-10 dark:opacity-15 absolute inset-0`} />

                  <span className="text-3xl relative z-10">{cat.emoji}</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200 relative z-10 text-center px-1">{cat.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 relative z-10">{cat.count} items</span>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
