import { getStore } from '@/lib/server/store';
import { badRequest, created, internalError, ok } from '@/lib/server/http';
import { parseWithSchema, productCreateSchema } from '@/lib/server/validators';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const store = getStore();
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      inStock: searchParams.get('inStock') || undefined,
      search: searchParams.get('search') || undefined,
      sort: searchParams.get('sort') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    const payload = await store.getProducts(filters);
    return ok(payload);
  } catch (error) {
    return internalError(error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = parseWithSchema(productCreateSchema, body);

    if (!parsed.success) {
      return badRequest('Invalid product payload', parsed.errors);
    }

    const store = getStore();
    const data = await store.createProduct(parsed.data);

    return created({
      success: true,
      data,
    });
  } catch (error) {
    return internalError(error);
  }
}
