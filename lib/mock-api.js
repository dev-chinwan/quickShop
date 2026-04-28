import {
  categories,
  offerBanners,
  products,
  getFeaturedProducts,
  getProductById,
  getRelatedProducts,
} from './data';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseNumber(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toBoolean(value) {
  return value === true || value === 'true';
}

function filterProducts(filters = {}) {
  let result = [...products];
  const minPrice = parseNumber(filters.minPrice);
  const maxPrice = parseNumber(filters.maxPrice);
  const search = filters.search?.trim().toLowerCase();

  if (filters.category) {
    result = result.filter((product) => product.category === filters.category);
  }

  if (minPrice !== undefined) {
    result = result.filter((product) => product.price >= minPrice);
  }

  if (maxPrice !== undefined) {
    result = result.filter((product) => product.price <= maxPrice);
  }

  if (toBoolean(filters.inStock)) {
    result = result.filter((product) => product.inStock);
  }

  if (search) {
    result = result.filter((product) =>
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search) ||
      product.tags?.some((tag) => tag.toLowerCase().includes(search))
    );
  }

  if (filters.sort === 'price-asc') {
    result.sort((left, right) => left.price - right.price);
  }

  if (filters.sort === 'price-desc') {
    result.sort((left, right) => right.price - left.price);
  }

  if (filters.sort === 'rating') {
    result.sort((left, right) => right.rating - left.rating);
  }

  return result;
}

export async function mockFetchProducts(filters = {}) {
  await delay(400);
  const data = filterProducts(filters);
  return { data, total: data.length };
}

export async function mockFetchFeaturedProducts() {
  await delay(300);
  return { data: getFeaturedProducts() };
}

export async function mockFetchCategories() {
  await delay(200);
  return { data: categories };
}

export async function mockFetchOfferBanners() {
  await delay(200);
  return { data: offerBanners };
}

export async function mockFetchProduct(id) {
  await delay(350);
  const product = getProductById(id);

  if (!product) {
    throw new Error('Product not found');
  }

  return { data: product };
}

export async function mockFetchRelatedProducts(productId) {
  await delay(250);
  const product = getProductById(productId);

  if (!product) {
    return { data: [] };
  }

  return { data: getRelatedProducts(product) };
}

export async function mockSearchProducts(query) {
  await delay(300);
  const search = query.trim().toLowerCase();

  if (!search) {
    return { data: [] };
  }

  const data = products.filter((product) =>
    product.name.toLowerCase().includes(search) ||
    product.category.toLowerCase().includes(search) ||
    product.tags?.some((tag) => tag.toLowerCase().includes(search))
  );

  return { data };
}

export async function mockPlaceOrder(payload) {
  await delay(1000);

  return {
    success: true,
    orderId: `QS-${Date.now()}`,
    estimatedDelivery: '10-15 minutes',
    total: payload.total,
    couponCode: payload.couponCode || null,
    itemCount: payload.items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

function toAdminProduct(product) {
  const categoryId = product.category || '';
  const status = product.status || 'active';
  const stock = Number.isFinite(product.stock) ? product.stock : 0;

  return {
    id: product.id,
    name: product.name || '',
    slug: product.slug || '',
    description: product.description || '',
    brand: product.brand || '',
    categoryId,
    categoryName: categoryId,
    price: Number(product.price || 0),
    compareAtPrice: Number(product.originalPrice || product.price || 0),
    currency: product.currency || 'USD',
    sku: product.sku || '',
    stock,
    inStock: product.inStock ?? stock > 0,
    unitLabel: product.unit || '',
    image: product.image || '',
    images: Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []),
    featured: Boolean(product.isFeatured),
    tags: Array.isArray(product.tags) ? product.tags : [],
    rating: Number(product.rating || 0),
    reviewCount: Number(product.reviews || 0),
    status,
    seo: product.seo || { title: '', description: '' },
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function fromAdminProduct(payload) {
  const stock = Number(payload.stock ?? 0);

  return {
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    brand: payload.brand || 'QuickShop',
    category: payload.categoryId,
    price: Number(payload.price || 0),
    originalPrice: Number(payload.compareAtPrice ?? payload.price ?? 0),
    currency: payload.currency || 'USD',
    sku: payload.sku,
    stock,
    inStock: payload.inStock ?? stock > 0,
    unit: payload.unitLabel || '1 unit',
    image: payload.image,
    images: Array.isArray(payload.images) ? payload.images : (payload.image ? [payload.image] : []),
    isFeatured: Boolean(payload.featured),
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    rating: Number(payload.rating || 0),
    reviews: Number(payload.reviewCount || 0),
    status: payload.status || 'active',
    seo: payload.seo || { title: '', description: '' },
    badge: payload.badge ?? null,
  };
}

function applyAdminFilters(allProducts, filters = {}) {
  let result = [...allProducts];
  const search = String(filters.search || '').trim().toLowerCase();
  const page = Math.max(parseNumber(filters.page) || 1, 1);
  const limit = Math.min(Math.max(parseNumber(filters.limit) || 10, 1), 100);

  if (filters.categoryId) {
    result = result.filter((product) => product.categoryId === filters.categoryId);
  }

  if (filters.status) {
    result = result.filter((product) => product.status === filters.status);
  }

  if (filters.featured !== undefined && filters.featured !== null && filters.featured !== '') {
    const featured = toBoolean(filters.featured);
    result = result.filter((product) => product.featured === featured);
  }

  if (search) {
    result = result.filter((product) =>
      product.name.toLowerCase().includes(search) ||
      product.slug.toLowerCase().includes(search) ||
      product.sku.toLowerCase().includes(search) ||
      product.categoryId.toLowerCase().includes(search)
    );
  }

  if (filters.sort === 'price-asc') {
    result.sort((left, right) => left.price - right.price);
  } else if (filters.sort === 'price-desc') {
    result.sort((left, right) => right.price - left.price);
  } else if (filters.sort === 'stock-asc') {
    result.sort((left, right) => left.stock - right.stock);
  } else if (filters.sort === 'stock-desc') {
    result.sort((left, right) => right.stock - left.stock);
  } else {
    result.sort((left, right) => String(right.updatedAt || '').localeCompare(String(left.updatedAt || '')));
  }

  const total = result.length;
  const start = (page - 1) * limit;
  const data = result.slice(start, start + limit);

  return { data, total, page, limit };
}

function findProductIndex(id) {
  return products.findIndex((product) => String(product.id) === String(id));
}

export async function mockAdminFetchProducts(filters = {}) {
  await delay(250);
  const all = products.map(toAdminProduct);
  return applyAdminFilters(all, filters);
}

export async function mockAdminFetchProduct(id) {
  await delay(180);
  const product = products.find((item) => String(item.id) === String(id));
  if (!product) {
    throw new Error('Product not found');
  }

  return { data: toAdminProduct(product) };
}

export async function mockAdminCreateProduct(payload) {
  await delay(250);
  const maxId = products.reduce((max, item) => {
    const current = Number(item.id);
    return Number.isFinite(current) ? Math.max(max, current) : max;
  }, 0);

  const now = new Date().toISOString();
  const next = {
    ...fromAdminProduct(payload),
    id: maxId + 1,
    createdAt: now,
    updatedAt: now,
  };

  products.push(next);
  return { data: toAdminProduct(next) };
}

export async function mockAdminUpdateProduct(id, payload) {
  await delay(220);
  const index = findProductIndex(id);
  if (index < 0) {
    throw new Error('Product not found');
  }

  const current = products[index];
  const updated = {
    ...current,
    ...fromAdminProduct({ ...toAdminProduct(current), ...payload }),
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updated;
  return { data: toAdminProduct(updated) };
}

export async function mockAdminDeleteProduct(id) {
  await delay(160);
  const index = findProductIndex(id);
  if (index < 0) {
    throw new Error('Product not found');
  }

  products.splice(index, 1);
  return { success: true };
}

export async function mockAdminUpdateProductStock(id, payload) {
  return mockAdminUpdateProduct(id, payload);
}

export async function mockAdminToggleProductFeatured(id, payload) {
  return mockAdminUpdateProduct(id, payload);
}
