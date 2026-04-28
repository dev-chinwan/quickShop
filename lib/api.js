import {
  mockAdminCreateProduct,
  mockAdminDeleteProduct,
  mockAdminFetchProduct,
  mockAdminFetchProducts,
  mockAdminToggleProductFeatured,
  mockAdminUpdateProduct,
  mockAdminUpdateProductStock,
  mockFetchCategories,
  mockFetchFeaturedProducts,
  mockFetchOfferBanners,
  mockFetchProduct,
  mockFetchProducts,
  mockFetchRelatedProducts,
  mockPlaceOrder,
  mockSearchProducts,
} from './mock-api';

const API_MODE = process.env.NEXT_PUBLIC_API_MODE?.trim() || 'mock';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || '/api';
const USE_MOCK_API = API_MODE !== 'backend';

function createSearchParams(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams;
}

function buildUrl(path, params) {
  const searchParams = createSearchParams(params);
  const query = searchParams.toString();
  const normalizedBaseUrl = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}${query ? `?${query}` : ''}`;
}

async function request(path, { method = 'GET', params, body, cache = 'no-store' } = {}) {
  const response = await fetch(buildUrl(path, params), {
    method,
    cache,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}

export const apiConfig = {
  mode: USE_MOCK_API ? 'mock' : 'backend',
  baseUrl: API_BASE_URL,
};

export async function fetchProducts(filters = {}) {
  if (USE_MOCK_API) {
    return mockFetchProducts(filters);
  }

  return request('/products', { params: filters });
}

export async function fetchFeaturedProducts() {
  if (USE_MOCK_API) {
    return mockFetchFeaturedProducts();
  }

  return request('/products/featured', { cache: 'force-cache' });
}

export async function fetchCategories() {
  if (USE_MOCK_API) {
    return mockFetchCategories();
  }

  return request('/catalog/categories', { cache: 'force-cache' });
}

export async function fetchOfferBanners() {
  if (USE_MOCK_API) {
    return mockFetchOfferBanners();
  }

  return request('/catalog/banners', { cache: 'force-cache' });
}

export async function fetchProduct(id) {
  if (USE_MOCK_API) {
    return mockFetchProduct(id);
  }

  return request(`/products/${id}`);
}

export async function fetchRelatedProducts(productId) {
  if (USE_MOCK_API) {
    return mockFetchRelatedProducts(productId);
  }

  return request(`/products/${productId}/related`);
}

export async function searchProducts(query) {
  if (USE_MOCK_API) {
    return mockSearchProducts(query);
  }

  return request('/products/search', { params: { q: query } });
}

export async function placeOrder(payload) {
  if (USE_MOCK_API) {
    return mockPlaceOrder(payload);
  }

  return request('/orders', {
    method: 'POST',
    body: payload,
  });
}

export async function fetchAdminProducts(filters = {}) {
  if (USE_MOCK_API) {
    return mockAdminFetchProducts(filters);
  }

  return request('/admin/products', { params: filters });
}

export async function fetchAdminProduct(id) {
  if (USE_MOCK_API) {
    return mockAdminFetchProduct(id);
  }

  return request(`/admin/products/${id}`);
}

export async function createAdminProduct(payload) {
  if (USE_MOCK_API) {
    return mockAdminCreateProduct(payload);
  }

  return request('/admin/products', {
    method: 'POST',
    body: payload,
  });
}

export async function updateAdminProduct(id, payload) {
  if (USE_MOCK_API) {
    return mockAdminUpdateProduct(id, payload);
  }

  return request(`/admin/products/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteAdminProduct(id) {
  if (USE_MOCK_API) {
    return mockAdminDeleteProduct(id);
  }

  return request(`/admin/products/${id}`, {
    method: 'DELETE',
  });
}

export async function updateAdminProductStock(id, payload) {
  if (USE_MOCK_API) {
    return mockAdminUpdateProductStock(id, payload);
  }

  return request(`/admin/products/${id}/stock`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function toggleAdminProductFeatured(id, payload) {
  if (USE_MOCK_API) {
    return mockAdminToggleProductFeatured(id, payload);
  }

  return request(`/admin/products/${id}/featured`, {
    method: 'PATCH',
    body: payload,
  });
}
