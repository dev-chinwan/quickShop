import { getStore } from '@/lib/server/store';
import { badRequest, internalError, notFound, ok } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const stock = Number(body.stock);

    if (!Number.isFinite(stock) || stock < 0) {
      return badRequest('stock must be a number greater than or equal to 0');
    }

    const nextStock = Math.trunc(stock);
    const inStock = typeof body.inStock === 'boolean' ? body.inStock : nextStock > 0;

    const store = getStore();
    const updated = await store.updateProduct(params.id, {
      stock: nextStock,
      inStock,
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
