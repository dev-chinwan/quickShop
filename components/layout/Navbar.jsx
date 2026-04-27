'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, Sun, Moon, User, X, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useSearch } from '@/hooks/useSearch';
import CartDrawer from '@/components/cart/CartDrawer';
import { formatPrice } from '@/lib/utils';

export default function Navbar() {
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { query, setQuery, results, loading, open, setOpen, clear } = useSearch();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [badgeKey, setBadgeKey] = useState(0);
  const searchRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setBadgeKey(k => k + 1);
  }, [totalItems]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/category?search=${encodeURIComponent(query)}`);
      clear();
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-sm border-b border-gray-100 dark:border-gray-800'
            : 'bg-white dark:bg-gray-950'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-ui font-700 text-xl tracking-tight hidden sm:block">
                <span className="text-gray-900 dark:text-white font-bold">Quick</span>
                <span className="gradient-text font-bold">Shop</span>
              </span>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-xl relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => query && setOpen(true)}
                    placeholder="Search groceries, vegetables, fruits..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-500/40 focus:bg-white dark:focus:bg-gray-700 transition-all"
                  />
                  {query && (
                    <button type="button" onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </form>

              {/* Search dropdown */}
              {open && (query || results.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
                  ) : results.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No results for "{query}"</div>
                  ) : (
                    <div>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide border-b border-gray-50 dark:border-gray-800">
                        {results.length} results
                      </div>
                      {results.slice(0, 6).map(product => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          onClick={clear}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={40}
                              height={40}
                              sizes="40px"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{product.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{product.category}</p>
                          </div>
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400 shrink-0">
                            {formatPrice(product.price)}
                          </span>
                        </Link>
                      ))}
                      {results.length > 6 && (
                        <button
                          onClick={() => { router.push(`/category?search=${encodeURIComponent(query)}`); clear(); }}
                          className="w-full p-3 text-sm text-green-600 dark:text-green-400 font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        >
                          View all {results.length} results →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:flex">
                <User className="w-5 h-5" />
              </button>

              <button
                onClick={() => setDrawerOpen(true)}
                className="relative flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-sm transition-all active:scale-95 shadow-lg shadow-green-500/25"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:block">Cart</span>
                {totalItems > 0 && (
                  <span
                    key={badgeKey}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold pop-in"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
