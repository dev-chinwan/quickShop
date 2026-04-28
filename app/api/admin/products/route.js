import { getStore } from '@/lib/server/store';
import { badRequest, created, internalError, ok } from '@/lib/server/http';
import { parseWithSchema, productCreateSchema } from '@/lib/server/validators';
import { fromAdminPayload, normalizeAdminFilters, toAdminProduct } from '@/lib/server/admin-products';

export const runtime = 'nodejs';

function paginate(data, page, limit) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const start = (safePage - 1) * safeLimit;

  return {
    data: data.slice(start, start + safeLimit),
    total: data.length,
    page: safePage,
    limit: safeLimit,
  };
}

function applyAdminFilters(products, filters) {
  let result = [...products];
  const search = String(filters.search || '').trim().toLowerCase();

  if (filters.categoryId) {
    result = result.filter((item) => item.categoryId === filters.categoryId);
  }

  if (filters.status) {
    result = result.filter((item) => item.status === filters.status);
  }

  if (filters.featured !== undefined && filters.featured !== null && filters.featured !== '') {
    const featured = filters.featured === 'true' || filters.featured === true;
    result = result.filter((item) => item.featured === featured);
  }

  if (search) {
    result = result.filter((item) =>
      item.name.toLowerCase().includes(search) ||
      item.slug.toLowerCase().includes(search) ||
      item.sku.toLowerCase().includes(search) ||
      item.categoryId.toLowerCase().includes(search)
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

  return result;
}

export async function GET(request) {
  try {
    const store = getStore();
    const filters = normalizeAdminFilters(request.nextUrl.searchParams);

    const [productsPayload, categoriesPayload] = await Promise.all([
      store.getProducts({ limit: 1000 }),
      store.getCategories(),
    ]);

    const mapped = productsPayload.data.map((item) => toAdminProduct(item, categoriesPayload.data));
    const filtered = applyAdminFilters(mapped, filters);

    return ok(paginate(filtered, filters.page, filters.limit));
  } catch (error) {
    return internalError(error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const normalized = fromAdminPayload(body);

    if (!normalized.success) {
      return badRequest('Invalid admin product payload', normalized.errors);
    }

    const parsed = parseWithSchema(productCreateSchema, normalized.data);

    if (!parsed.success) {
      return badRequest('Invalid product payload', parsed.errors);
    }

    const store = getStore();
    const createdProduct = await store.createProduct(parsed.data);
    const categoriesPayload = await store.getCategories();

    return created({
      data: toAdminProduct(createdProduct, categoriesPayload.data),
    });
  } catch (error) {
    return internalError(error);
  }
}
