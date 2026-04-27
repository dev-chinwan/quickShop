import { getStore } from '@/lib/server/store';
import { internalError, ok } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const store = getStore();
    const payload = await store.getFeaturedProducts();
    return ok(payload);
  } catch (error) {
    return internalError(error);
  }
}
