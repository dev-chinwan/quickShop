'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  deleteAdminProduct,
  fetchAdminProducts,
  toggleAdminProductFeatured,
  updateAdminProductStock,
} from '@/lib/api';
import ProductsTable from '@/components/admin/ProductsTable';
import ProductDeleteModal from '@/components/admin/ProductDeleteModal';
import { useCategories } from '@/hooks/useCatalog';

const defaultFilters = {
  search: '',
  categoryId: '',
  status: '',
  featured: '',
  sort: '',
  page: 1,
  limit: 10,
};

export default function AdminProductsPage() {
  const { categories } = useCategories();
  const [filters, setFilters] = useState(defaultFilters);
  const [payload, setPayload] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminProducts(filters)
      .then((response) => {
        setPayload(response);
      })
      .catch((error) => {
        toast.error(error.message || 'Failed to load products');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = useMemo(() => Math.max(Math.ceil((payload.total || 0) / (payload.limit || 10)), 1), [payload]);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

  async function handleDelete(id) {
    try {
      setDeleteLoading(true);
      await deleteAdminProduct(id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      load();
    } catch (error) {
      toast.error(error.message || 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleToggleFeatured(product) {
    try {
      await toggleAdminProductFeatured(product.id, { featured: !product.featured });
      toast.success('Featured status updated');
      load();
    } catch (error) {
      toast.error(error.message || 'Failed to update featured status');
    }
  }

  async function handleUpdateStock(product, stock) {
    try {
      await updateAdminProductStock(product.id, { stock: Math.max(0, Number(stock) || 0) });
      toast.success('Stock updated');
      load();
    } catch (error) {
      toast.error(error.message || 'Failed to update stock');
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-gray-900 dark:text-white">Manage Products</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Create, edit, remove, and adjust inventory directly from this table.</p>
          </div>
          <Link href="/admin/products/new" className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
            New Product
          </Link>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            <input
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
              placeholder="Search name, SKU, slug"
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
            />
            <select value={filters.categoryId} onChange={(event) => updateFilter('categoryId', event.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950">
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950">
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
            <select value={filters.featured} onChange={(event) => updateFilter('featured', event.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950">
              <option value="">Featured: All</option>
              <option value="true">Featured only</option>
              <option value="false">Not featured</option>
            </select>
            <select value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950">
              <option value="">Sort: Recent</option>
              <option value="price-asc">Price low to high</option>
              <option value="price-desc">Price high to low</option>
              <option value="stock-asc">Stock low to high</option>
              <option value="stock-desc">Stock high to low</option>
            </select>
            <button
              onClick={() => setFilters(defaultFilters)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Reset
            </button>
          </div>
        </section>

        <ProductsTable
          products={payload.data}
          loading={loading}
          onDeleteClick={setDeleteTarget}
          onToggleFeatured={handleToggleFeatured}
          onUpdateStock={handleUpdateStock}
        />

        <section className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Total: {payload.total || 0}</p>
          <div className="inline-flex items-center gap-2">
            <button
              disabled={filters.page <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-700"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">Page {filters.page} of {totalPages}</span>
            <button
              disabled={filters.page >= totalPages}
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(prev.page + 1, totalPages) }))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-700"
            >
              Next
            </button>
          </div>
        </section>
      </div>

      <ProductDeleteModal
        open={Boolean(deleteTarget)}
        product={deleteTarget}
        loading={deleteLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
