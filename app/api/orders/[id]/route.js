import { getStore } from '@/lib/server/store';
import { internalError, notFound, ok } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  try {
    const store = getStore();
    const data = await store.getOrderById(params.id);

    if (!data) {
      return notFound('Order not found');
    }

    return ok({ data });
  } catch (error) {
    return internalError(error);
  }
}
