'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCatalog';
import { formatPrice } from '@/lib/utils';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/product/ProductCardSkeleton';

function CategoryPageInner() {
  const searchParams = useSearchParams();
  const { categories } = useCategories();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: 0,
    maxPrice: 20,
    sort: 'default',
    inStock: false,
  });

  useEffect(() => {
    setFilters(f => ({
      ...f,
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
    }));
  }, [searchParams]);

  const activeFilters = {
    ...filters,
    minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
    maxPrice: filters.maxPrice < 20 ? filters.maxPrice : undefined,
    sort: filters.sort !== 'default' ? filters.sort : undefined,
    inStock: filters.inStock || undefined,
    category: filters.category || undefined,
    search: filters.search || undefined,
  };

  const { products, loading } = useProducts(activeFilters);

  const updateFilter = (key, value) => setFilters(f => ({ ...f, [key]: value }));
  const clearFilters = () => setFilters({ category: '', search: '', minPrice: 0, maxPrice: 20, sort: 'default', inStock: false });
  const hasFilters = filters.category || filters.search || filters.minPrice > 0 || filters.maxPrice < 20 || filters.inStock || filters.sort !== 'default';

  const currentCat = categories.find(c => c.id === filters.category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-green-500 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-700 dark:text-gray-200 font-medium capitalize">
          {filters.search ? `Search: "${filters.search}"` : currentCat ? currentCat.name : 'All Products'}
        </span>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — Desktop */}
        <aside className="hidden lg:block w-60 shrink-0">
          <FilterPanel categories={categories} filters={filters} updateFilter={updateFilter} clearFilters={clearFilters} hasFilters={hasFilters} />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-xl font-bold font-display text-gray-900 dark:text-white capitalize">
                {filters.search ? `Results for "${filters.search}"` : currentCat ? `${currentCat.emoji} ${currentCat.name}` : '🛒 All Products'}
              </h1>
              {!loading && (
                <p className="text-sm text-gray-400 mt-0.5">{products.length} products found</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-green-400 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters {hasFilters && <span className="w-2 h-2 bg-green-500 rounded-full" />}
              </button>

              {/* Sort */}
              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-green-500/30 cursor-pointer"
                >
                  <option value="default">Sort: Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active filter tags */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-5">
              {filters.category && (
                <FilterTag label={`Category: ${filters.category}`} onRemove={() => updateFilter('category', '')} />
              )}
              {filters.search && (
                <FilterTag label={`Search: ${filters.search}`} onRemove={() => updateFilter('search', '')} />
              )}
              {filters.inStock && (
                <FilterTag label="In Stock Only" onRemove={() => updateFilter('inStock', false)} />
              )}
              {(filters.minPrice > 0 || filters.maxPrice < 20) && (
                <FilterTag label={`${formatPrice(filters.minPrice)} - ${formatPrice(filters.maxPrice)}`} onRemove={() => { updateFilter('minPrice', 0); updateFilter('maxPrice', 20); }} />
              )}
              <button onClick={clearFilters} className="text-xs text-red-500 hover:underline font-medium px-2">
                Clear all
              </button>
            </div>
          )}

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-950 p-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900 dark:text-white">Filters</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <FilterPanel categories={categories} filters={filters} updateFilter={updateFilter} clearFilters={clearFilters} hasFilters={hasFilters} />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterTag({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium px-3 py-1.5 rounded-full">
      {label}
      <button onClick={onRemove}>
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function FilterPanel({ categories, filters, updateFilter, clearFilters, hasFilters }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900 dark:text-white font-ui">Filters</h2>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear all</button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Category</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter('category', '')}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${!filters.category ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 ${filters.category === cat.id ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <span>{cat.emoji}</span>
              {cat.name}
              <span className="ml-auto text-xs text-gray-400">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Price Range</h3>
        <div className="px-1">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>{formatPrice(filters.minPrice)}</span>
            <span>{formatPrice(filters.maxPrice)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={filters.maxPrice}
            onChange={(e) => updateFilter('maxPrice', parseFloat(e.target.value))}
            className="w-full accent-green-500"
          />
          <div className="flex gap-2 mt-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => updateFilter('minPrice', parseFloat(e.target.value) || 0)}
              className="w-1/2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500/30"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', parseFloat(e.target.value) || 20)}
              className="w-1/2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500/30"
            />
          </div>
        </div>
      </div>

      {/* In Stock */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => updateFilter('inStock', e.target.checked)}
            className="w-4 h-4 accent-green-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">In Stock Only</span>
        </label>
      </div>
    </div>
  );
}

function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
      <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search terms</p>
      <button
        onClick={onClear}
        className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-all"
      >
        Clear Filters
      </button>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24 text-gray-400">Loading...</div>}>
      <CategoryPageInner />
    </Suspense>
  );
}
