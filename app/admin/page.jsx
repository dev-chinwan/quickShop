'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchAdminProducts } from '@/lib/api';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAdminProducts({ page: 1, limit: 1000 })
      .then((payload) => {
        if (!active) return;
        setProducts(payload.data || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = products.length;
    const lowStock = products.filter((item) => Number(item.stock) > 0 && Number(item.stock) < 10).length;
    const featured = products.filter((item) => item.featured).length;
    const drafts = products.filter((item) => item.status === 'draft').length;

    return { total, lowStock, featured, drafts };
  }, [products]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-amber-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Monitor inventory health and manage products from one place.</p>
          </div>
          <Link
            href="/admin/products"
            className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/20 hover:bg-green-700"
          >
            Manage Products
          </Link>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Products" value={stats.total} accent="from-blue-500 to-cyan-500" loading={loading} />
          <StatCard title="Low Stock" value={stats.lowStock} accent="from-orange-500 to-amber-500" loading={loading} />
          <StatCard title="Featured" value={stats.featured} accent="from-indigo-500 to-sky-500" loading={loading} />
          <StatCard title="Drafts" value={stats.drafts} accent="from-fuchsia-500 to-pink-500" loading={loading} />
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Next Actions</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <ActionCard title="Create Product" href="/admin/products/new" description="Add a new SKU with pricing and stock fields." />
            <ActionCard title="Review Inventory" href="/admin/products?sort=stock-asc" description="Prioritize products with low stock values." />
            <ActionCard title="Featured Lineup" href="/admin/products?featured=true" description="Curate homepage featured products quickly." />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, accent, loading }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{loading ? '...' : value}</p>
    </article>
  );
}

function ActionCard({ title, description, href }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-green-400 hover:bg-green-50 dark:border-gray-700 dark:hover:border-green-500 dark:hover:bg-green-900/20"
    >
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </Link>
  );
}
