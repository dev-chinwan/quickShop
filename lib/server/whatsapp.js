const META_GRAPH_BASE_URL = 'https://graph.facebook.com';

function mapFetchError(error, endpoint) {
  const cause = error?.cause;
  const causeCode = cause?.code || error?.code;
  const causeMessage = cause?.message || error?.message || 'Unknown network error';

  if (causeCode === 'ENOTFOUND' || causeCode === 'EAI_AGAIN') {
    return {
      code: 'WHATSAPP_DNS_ERROR',
      message: 'Unable to resolve graph.facebook.com from this environment',
      details: {
        endpoint,
        causeCode,
        causeMessage,
      },
    };
  }

  if (causeCode === 'ETIMEDOUT' || causeCode === 'ECONNRESET' || causeCode === 'ECONNREFUSED') {
    return {
      code: 'WHATSAPP_NETWORK_ERROR',
      message: 'Network connection to Meta WhatsApp API failed',
      details: {
        endpoint,
        causeCode,
        causeMessage,
      },
    };
  }

  if (causeCode === 'DEPTH_ZERO_SELF_SIGNED_CERT' || causeCode === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
    return {
      code: 'WHATSAPP_TLS_ERROR',
      message: 'TLS certificate validation failed while connecting to Meta WhatsApp API',
      details: {
        endpoint,
        causeCode,
        causeMessage,
      },
    };
  }

  return {
    code: 'WHATSAPP_SEND_FAILED',
    message: 'Meta WhatsApp network request failed',
    details: {
      endpoint,
      causeCode,
      causeMessage,
      errorName: error?.name,
    },
  };
}

function parseTimeout(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 10000;
  }
  return parsed;
}

function normalizePhone(value) {
  return String(value || '').trim().replace(/[^\d+]/g, '');
}

function isValidPhone(value) {
  const normalized = normalizePhone(value);
  return /^\+?[1-9]\d{7,14}$/.test(normalized);
}

export function getWhatsAppConfig() {
  return {
    enabled: String(process.env.WHATSAPP_ENABLED || 'false').toLowerCase() === 'true',
    strictMode: String(process.env.WHATSAPP_STRICT_MODE || 'true').toLowerCase() === 'true',
    apiVersion: process.env.WHATSAPP_META_API_VERSION || 'v22.0',
    accessToken: process.env.WHATSAPP_META_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_META_PHONE_NUMBER_ID || '',
    ownerPhone: normalizePhone(process.env.WHATSAPP_OWNER_PHONE || ''),
    timeoutMs: parseTimeout(process.env.WHATSAPP_TIMEOUT_MS),
  };
}

export class WhatsAppSendError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'WhatsAppSendError';
    this.code = details.code || 'WHATSAPP_SEND_FAILED';
    this.status = details.status;
    this.details = details.details;
  }
}

export function validateWhatsAppConfig(config) {
  if (!config.enabled) {
    return;
  }

  if (!config.accessToken) {
    throw new WhatsAppSendError('Missing WHATSAPP_META_ACCESS_TOKEN', {
      code: 'WHATSAPP_CONFIG_ERROR',
    });
  }

  if (!config.phoneNumberId) {
    throw new WhatsAppSendError('Missing WHATSAPP_META_PHONE_NUMBER_ID', {
      code: 'WHATSAPP_CONFIG_ERROR',
    });
  }

  if (!config.ownerPhone || !isValidPhone(config.ownerPhone)) {
    throw new WhatsAppSendError('Missing or invalid WHATSAPP_OWNER_PHONE', {
      code: 'WHATSAPP_CONFIG_ERROR',
    });
  }
}

export async function sendWhatsAppTextMessage({ to, body }) {
  const config = getWhatsAppConfig();
  validateWhatsAppConfig(config);

  if (!config.enabled) {
    return {
      ok: true,
      skipped: true,
      id: null,
    };
  }

  if (!isValidPhone(to)) {
    throw new WhatsAppSendError('Invalid destination phone number', {
      code: 'WHATSAPP_INVALID_PHONE',
      details: { to },
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  const endpoint = `${META_GRAPH_BASE_URL}/${config.apiVersion}/${config.phoneNumberId}/messages`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizePhone(to),
        type: 'text',
        text: {
          preview_url: false,
          body,
        },
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new WhatsAppSendError('Meta WhatsApp API request failed', {
        code: 'WHATSAPP_PROVIDER_ERROR',
        status: response.status,
        details: payload,
      });
    }

    return {
      ok: true,
      skipped: false,
      id: payload?.messages?.[0]?.id || null,
      raw: payload,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new WhatsAppSendError('Meta WhatsApp API request timed out', {
        code: 'WHATSAPP_TIMEOUT',
        details: {
          endpoint,
          timeoutMs: config.timeoutMs,
        },
      });
    }

    if (error instanceof WhatsAppSendError) {
      throw error;
    }

    const mapped = mapFetchError(error, endpoint);
    throw new WhatsAppSendError(mapped.message, {
      code: mapped.code,
      details: mapped.details,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export function formatOrderOwnerMessage(order) {
  const customerName = order.customer?.name || 'Customer';
  const customerPhone = order.customer?.phone || 'N/A';
  const customerEmail = order.customer?.email || 'N/A';
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const itemLines = order.items
    .map((item) => `- ${item.name} x${item.quantity} (${order.currency} ${Number(item.price || 0).toFixed(2)})`)
    .join('\n');
  const address = order.shippingAddress
    ? [
        order.shippingAddress.line1,
        order.shippingAddress.line2,
        order.shippingAddress.city,
        order.shippingAddress.state,
        order.shippingAddress.postalCode,
        order.shippingAddress.country,
      ]
        .filter(Boolean)
        .join(', ')
    : 'N/A';

  return [
    'New QuickShop order received',
    `Order ID: ${order.orderId}`,
    `Customer: ${customerName}`,
    `Phone: ${customerPhone}`,
    `Email: ${customerEmail}`,
    `Items: ${itemCount}`,
    `Subtotal: ${order.currency} ${Number(order.subtotal || 0).toFixed(2)}`,
    `Discount: ${order.currency} ${Number(order.discount || 0).toFixed(2)}`,
    `Shipping: ${order.currency} ${Number(order.shippingFee || 0).toFixed(2)}`,
    `Total: ${order.currency} ${Number(order.total || 0).toFixed(2)}`,
    `Payment: ${order.paymentMethod.toUpperCase()}`,
    `Address: ${address}`,
    `Notes: ${order.notes || 'N/A'}`,
    'Items detail:',
    itemLines || '- N/A',
  ].join('\n');
}

export function formatOrderCustomerMessage(order) {
  const customerName = order.customer?.name || 'Customer';

  return [
    `Hi ${customerName}, your QuickShop order is confirmed.`,
    `Order ID: ${order.orderId}`,
    `Total: ${order.currency} ${order.total.toFixed(2)}`,
    `Estimated delivery: ${order.estimatedDelivery}`,
    'Thanks for shopping with QuickShop.',
  ].join('\n');
}

export function getNormalizedPhone(value) {
  return normalizePhone(value);
}
