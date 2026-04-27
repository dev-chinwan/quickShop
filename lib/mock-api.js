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
