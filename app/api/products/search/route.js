import { getStore } from '@/lib/server/store';
import { internalError, ok } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const q = request.nextUrl.searchParams.get('q') || '';
    const store = getStore();
    const payload = await store.searchProducts(q);
    return ok(payload);
  } catch (error) {
    return internalError(error);
  }
}
