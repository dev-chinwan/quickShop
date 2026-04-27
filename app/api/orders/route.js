import { getStore } from '@/lib/server/store';
import { badRequest, created, internalError, ok } from '@/lib/server/http';
import { orderCreateSchema, parseWithSchema } from '@/lib/server/validators';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const store = getStore();
    const payload = await store.getOrders();
    return ok(payload);
  } catch (error) {
    return internalError(error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = parseWithSchema(orderCreateSchema, body);

    if (!parsed.success) {
      return badRequest('Invalid order payload', parsed.errors);
    }

    const store = getStore();
    const order = await store.createOrder(parsed.data);

    return created({
      success: true,
      orderId: order.orderId,
      estimatedDelivery: order.estimatedDelivery,
      total: order.total,
      couponCode: order.couponCode || null,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      data: order,
    });
  } catch (error) {
    return internalError(error);
  }
}
