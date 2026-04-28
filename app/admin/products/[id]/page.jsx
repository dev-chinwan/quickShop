'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ProductForm from '@/components/admin/ProductForm';
import { useCategories } from '@/hooks/useCatalog';
import { fetchAdminProduct, updateAdminProduct } from '@/lib/api';

export default function EditAdminProductPage() {
  const params = useParams();
  const router = useRouter();
  const { categories } = useCategories();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchAdminProduct(params.id)
      .then((response) => {
        if (active) {
          setProduct(response.data);
        }
      })
      .catch((error) => {
        toast.error(error.message || 'Failed to load product');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [params.id]);

  async function handleSubmit(payload) {
    try {
      setSaving(true);
      await updateAdminProduct(params.id, payload);
      toast.success('Product updated');
      router.push('/admin/products');
    } catch (error) {
      toast.error(error.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-500">Loading product...</div>;
  }

  if (!product) {
    return <div className="py-20 text-center text-sm text-gray-500">Product not found.</div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h1 className="font-display text-3xl text-gray-900 dark:text-white">Edit Product</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Update pricing, inventory, and metadata fields.</p>
          <div className="mt-6">
            <ProductForm
              initialData={product}
              categories={categories}
              loading={saving}
              submitLabel="Save Changes"
              onSubmit={handleSubmit}
              onCancel={() => router.push('/admin/products')}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
