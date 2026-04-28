import { getStore } from '@/lib/server/store';
import { badRequest, internalError, notFound, ok } from '@/lib/server/http';
import { parseWithSchema, productUpdateSchema } from '@/lib/server/validators';
import { fromAdminPayload, toAdminProduct } from '@/lib/server/admin-products';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  try {
    const store = getStore();
    const product = await store.getProductById(params.id);

    if (!product) {
      return notFound('Product not found');
    }

    const categoriesPayload = await store.getCategories();
    return ok({ data: toAdminProduct(product, categoriesPayload.data) });
  } catch (error) {
    return internalError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const store = getStore();
    const current = await store.getProductById(params.id);

    if (!current) {
      return notFound('Product not found');
    }

    const body = await request.json();
    const normalized = fromAdminPayload(body, current);

    if (!normalized.success) {
      return badRequest('Invalid admin product update payload', normalized.errors);
    }

    const parsed = parseWithSchema(productUpdateSchema, normalized.data);

    if (!parsed.success) {
      return badRequest('Invalid product update payload', parsed.errors);
    }

    const updated = await store.updateProduct(params.id, parsed.data);

    if (!updated) {
      return notFound('Product not found');
    }

    const categoriesPayload = await store.getCategories();
    return ok({
      success: true,
      data: toAdminProduct(updated, categoriesPayload.data),
    });
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
