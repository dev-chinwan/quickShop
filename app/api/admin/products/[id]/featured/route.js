import { getStore } from '@/lib/server/store';
import { badRequest, internalError, notFound, ok } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();

    if (typeof body.featured !== 'boolean') {
      return badRequest('featured must be a boolean');
    }

    const store = getStore();
    const updated = await store.updateProduct(params.id, {
      isFeatured: body.featured,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      return notFound('Product not found');
    }

    return ok({ success: true, data: updated });
  } catch (error) {
    return internalError(error);
  }
}
