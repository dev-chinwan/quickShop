'use client';

import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';

function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const defaultForm = {
  name: '',
  slug: '',
  description: '',
  brand: '',
  categoryId: '',
  price: '',
  compareAtPrice: '',
  currency: 'INR',
  sku: '',
  stock: 0,
  inStock: true,
  unitLabel: '',
  image: '',
  images: '',
  featured: false,
  tags: '',
  status: 'active',
  seo: {
    title: '',
    description: '',
  },
};

export default function ProductForm({
  initialData,
  categories,
  loading,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const inputClass = 'w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-green-500/30';
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!initialData) {
      setForm(defaultForm);
      return;
    }

    setForm({
      ...defaultForm,
      ...initialData,
      price: initialData.price ?? '',
      compareAtPrice: initialData.compareAtPrice ?? '',
      stock: initialData.stock ?? 0,
      images: Array.isArray(initialData.images) ? initialData.images.join(', ') : '',
      tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
      seo: {
        title: initialData.seo?.title || '',
        description: initialData.seo?.description || '',
      },
    });
  }, [initialData]);

  const categoryOptions = useMemo(() => categories || [], [categories]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.slug.trim()) nextErrors.slug = 'Slug is required';
    if (!form.description.trim()) nextErrors.description = 'Description is required';
    if (!form.categoryId) nextErrors.categoryId = 'Category is required';
    if (!form.sku.trim()) nextErrors.sku = 'SKU is required';
    if (Number(form.price) < 0 || form.price === '') nextErrors.price = 'Valid price is required';
    if (Number(form.compareAtPrice || form.price) < Number(form.price || 0)) {
      nextErrors.compareAtPrice = 'Compare at price must be >= price';
    }
    if (Number(form.stock) < 0) nextErrors.stock = 'Stock cannot be negative';
    if (!form.unitLabel.trim()) nextErrors.unitLabel = 'Unit label is required';
    if (!form.image.trim()) nextErrors.image = 'Image URL is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    onSubmit?.({
      ...form,
      slug: toSlug(form.slug || form.name),
      price: Number(form.price),
      compareAtPrice: Number(form.compareAtPrice || form.price),
      stock: Math.max(0, Number(form.stock) || 0),
      inStock: Boolean(form.inStock),
      images: form.images
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      tags: form.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2">
        <Field label="Product Name" error={errors.name}>
          <input
            value={form.name}
            onChange={(event) => {
              const name = event.target.value;
              updateField('name', name);
              if (!initialData?.slug) {
                updateField('slug', toSlug(name));
              }
            }}
            className={inputClass}
            placeholder="Fresh Apples"
          />
        </Field>
        <Field label="Slug" error={errors.slug}>
          <input
            value={form.slug}
            onChange={(event) => updateField('slug', toSlug(event.target.value))}
            className={inputClass}
            placeholder="fresh-apples"
          />
        </Field>
        <Field label="SKU" error={errors.sku}>
          <input value={form.sku} onChange={(event) => updateField('sku', event.target.value)} className={inputClass} />
        </Field>
        <Field label="Category" error={errors.categoryId}>
          <select
            value={form.categoryId}
            onChange={(event) => updateField('categoryId', event.target.value)}
            className={inputClass}
          >
            <option value="">Select category</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Price" error={errors.price}>
          <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => updateField('price', event.target.value)} className={inputClass} />
        </Field>
        <Field label="Compare At Price" error={errors.compareAtPrice}>
          <input type="number" min="0" step="0.01" value={form.compareAtPrice} onChange={(event) => updateField('compareAtPrice', event.target.value)} className={inputClass} />
        </Field>
        <Field label="Stock" error={errors.stock}>
          <input type="number" min="0" value={form.stock} onChange={(event) => updateField('stock', event.target.value)} className={inputClass} />
        </Field>
        <Field label="Unit Label" error={errors.unitLabel}>
          <input value={form.unitLabel} onChange={(event) => updateField('unitLabel', event.target.value)} className={inputClass} placeholder="500g" />
        </Field>
      </section>

      <Field label="Description" error={errors.description}>
        <textarea
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          className={`${inputClass} min-h-28`}
        />
      </Field>

      <section className="grid gap-4 md:grid-cols-2">
        <Field label="Image URL" error={errors.image}>
          <input value={form.image} onChange={(event) => updateField('image', event.target.value)} className={inputClass} />
        </Field>
        <Field label="Gallery Images (comma separated)">
          <input value={form.images} onChange={(event) => updateField('images', event.target.value)} className={inputClass} />
        </Field>
        <Field label="Brand">
          <input value={form.brand} onChange={(event) => updateField('brand', event.target.value)} className={inputClass} />
        </Field>
        <Field label="Currency">
          <input value={form.currency} onChange={(event) => updateField('currency', event.target.value.toUpperCase())} className={inputClass} maxLength={3} />
        </Field>
        <Field label="Tags (comma separated)">
          <input value={form.tags} onChange={(event) => updateField('tags', event.target.value)} className={inputClass} />
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={(event) => updateField('status', event.target.value)} className={inputClass}>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </Field>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Field label="SEO Title">
          <input value={form.seo.title} onChange={(event) => setForm((prev) => ({ ...prev, seo: { ...prev.seo, title: event.target.value } }))} className={inputClass} />
        </Field>
        <Field label="SEO Description">
          <input value={form.seo.description} onChange={(event) => setForm((prev) => ({ ...prev, seo: { ...prev.seo, description: event.target.value } }))} className={inputClass} />
        </Field>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input type="checkbox" checked={form.featured} onChange={(event) => updateField('featured', event.target.checked)} className="accent-green-600" />
          Featured product
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input type="checkbox" checked={form.inStock} onChange={(event) => updateField('inStock', event.target.checked)} className="accent-green-600" />
          In stock
        </label>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-800 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{submitLabel}</Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  );
}
