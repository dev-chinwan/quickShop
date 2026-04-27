'use client';

import Link from 'next/link';
import { useOfferBanners } from '@/hooks/useCatalog';

export default function OfferBanners() {
  const { banners, loading } = useOfferBanners();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-[168px] rounded-2xl skeleton" />
            ))
          : banners.map((banner) => (
              <Link
                key={banner.id}
                href={`/category?category=${banner.category}`}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${banner.gradient} p-6 text-left group transition-transform hover:scale-[1.02] active:scale-[0.99]`}
              >
                <div className="absolute -right-8 -bottom-8 text-8xl opacity-20 group-hover:opacity-30 transition-opacity">
                  {banner.emoji}
                </div>

                <div className="relative z-10">
                  <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-1">Limited offer</p>
                  <h3 className="text-white text-xl font-bold font-display mb-1">{banner.title}</h3>
                  <p className="text-white/75 text-sm mb-4">{banner.subtitle}</p>
                  <span className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">
                    {banner.cta} →
                  </span>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
