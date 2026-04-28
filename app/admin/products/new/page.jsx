'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ProductForm from '@/components/admin/ProductForm';
import { useCategories } from '@/hooks/useCatalog';
import { createAdminProduct } from '@/lib/api';

export default function NewAdminProductPage() {
  const router = useRouter();
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(payload) {
    try {
      setLoading(true);
      await createAdminProduct(payload);
      toast.success('Product created');
      router.push('/admin/products');
    } catch (error) {
      toast.error(error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h1 className="font-display text-3xl text-gray-900 dark:text-white">Create Product</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Add complete product details with required field mapping.</p>
          <div className="mt-6">
            <ProductForm
              categories={categories}
              loading={loading}
              submitLabel="Create Product"
              onSubmit={handleSubmit}
              onCancel={() => router.push('/admin/products')}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
