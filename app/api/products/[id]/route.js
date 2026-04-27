import { getStore } from '@/lib/server/store';
import { badRequest, internalError, notFound, ok } from '@/lib/server/http';
import { parseWithSchema, productUpdateSchema } from '@/lib/server/validators';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  try {
    const store = getStore();
    const data = await store.getProductById(params.id);

    if (!data) {
      return notFound('Product not found');
    }

    return ok({ data });
  } catch (error) {
    return internalError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const parsed = parseWithSchema(productUpdateSchema, body);

    if (!parsed.success) {
      return badRequest('Invalid product update payload', parsed.errors);
    }

    const store = getStore();
    const data = await store.updateProduct(params.id, parsed.data);

    if (!data) {
      return notFound('Product not found');
    }

    return ok({ success: true, data });
  } catch (error) {
    return internalError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const store = getStore();
    const deleted = await store.deleteProduct(params.id);

    if (!deleted) {
      return notFound('Product not found');
    }

    return ok({ success: true });
  } catch (error) {
    return internalError(error);
  }
}
