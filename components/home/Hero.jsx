'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Shield, Leaf, Clock3 } from 'lucide-react';
import homeContent from '@/data/home-content.json';

export default function Hero() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const { hero } = homeContent;
  const selectedHeadline = hero.headlineOptions[hero.activeHeadlineIndex] ?? hero.headlineOptions[0];
  const iconMap = {
    Clock3,
    Leaf,
    Shield,
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/category?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-300/20 dark:bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-lime-300/20 dark:bg-lime-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-full px-4 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 mb-6 shadow-sm">
          <Shield className="w-3.5 h-3.5" />
          {hero.badgeText}
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-gray-900 dark:text-white mb-5 leading-tight">Daily essentials, <br />
          <span className="gradient-text">{selectedHeadline}</span>
        </h1>

        <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
          {hero.description}
        </p>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="relative max-w-xl mx-auto mb-6"
        >
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30 border border-gray-100 dark:border-gray-700 overflow-hidden p-2">
            <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={hero.searchPlaceholder}
              className="flex-1 px-3 py-2 text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-400 text-base"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all active:scale-95 shrink-0"
            >
              {hero.searchButtonLabel}
            </button>
          </div>
        </form>

        {/* Quick suggestions */}
        <div className="flex flex-wrap justify-center gap-2 mb-14">
          {hero.suggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              onClick={() => router.push(`/category?search=${encodeURIComponent(suggestion.query)}`)}
              className="text-sm bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-3.5 py-1.5 rounded-full hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 transition-all"
            >
              {suggestion.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 text-center">
          {hero.stats.map(({ icon, label, value }) => {
            const Icon = iconMap[icon] ?? Shield;

            return (
            <div key={label} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </section>
  );
}
