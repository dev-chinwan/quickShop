import { getStore } from '@/lib/server/store';
import { internalError, ok } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  try {
    const store = getStore();
    const payload = await store.getRelatedProducts(params.id);
    return ok(payload);
  } catch (error) {
    return internalError(error);
  }
}
