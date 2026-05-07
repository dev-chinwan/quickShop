import { getStore } from '@/lib/server/store';
import { badRequest, created, internalError, ok } from '@/lib/server/http';
import { sendOrderWhatsAppNotifications } from '@/lib/server/notifications';
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

    const notificationResult = await sendOrderWhatsAppNotifications(order);
    if (!notificationResult.ok && notificationResult.strictMode) {
      console.error('WhatsApp delivery failed for order', {
        orderId: order.orderId,
        failures: notificationResult.failures,
      });

      return Response.json(
        {
          success: false,
          code: 'WHATSAPP_DELIVERY_FAILED',
          message: 'Order created but WhatsApp delivery failed',
          orderId: order.orderId,
          notification: {
            strictMode: true,
            results: notificationResult.results,
          },
        },
        { status: 502 }
      );
    }

    return created({
      success: true,
      orderId: order.orderId,
      estimatedDelivery: order.estimatedDelivery,
      total: order.total,
      couponCode: order.couponCode || null,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      notification: {
        sent: !notificationResult.skipped,
        strictMode: notificationResult.strictMode,
        results: notificationResult.results,
      },
      data: order,
    });
  } catch (error) {
    return internalError(error);
  }
}
