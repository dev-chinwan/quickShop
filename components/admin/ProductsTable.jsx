'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export default function ProductsTable({ products, loading, onDeleteClick, onToggleFeatured, onUpdateStock }) {
  const [stockDrafts, setStockDrafts] = useState({});

  const rows = useMemo(() => products || [], [products]);

  if (loading) {
    return <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-sm text-gray-500">Loading products...</div>;
  }

  if (rows.length === 0) {
    return <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-sm text-gray-500">No products found for current filters.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">Product</th>
            <th className="px-4 py-3 text-left">Category</th>
            <th className="px-4 py-3 text-right">Price</th>
            <th className="px-4 py-3 text-right">Stock</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Featured</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((product) => {
            const draftStock = stockDrafts[product.id] ?? product.stock;
            return (
              <tr key={product.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-4 py-3 min-w-72">
                  <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sku}</p>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{product.categoryName || product.categoryId}</td>
                <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-100 font-medium">{formatPrice(product.price)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={draftStock}
                      onChange={(event) => setStockDrafts((prev) => ({ ...prev, [product.id]: event.target.value }))}
                      className="w-20 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-1 text-right"
                    />
                    <button
                      onClick={() => onUpdateStock?.(product, Number(draftStock))}
                      className="text-xs font-semibold text-green-600 hover:text-green-700"
                    >
                      Save
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${product.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onToggleFeatured?.(product)}
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${product.featured ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
                  >
                    {product.featured ? 'Yes' : 'No'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-green-400 hover:text-green-600 dark:border-gray-700 dark:text-gray-200"
                    >
                      Edit
                    </Link>
                    <Button size="sm" variant="danger" onClick={() => onDeleteClick?.(product)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
