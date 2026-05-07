const META_GRAPH_BASE_URL = 'https://graph.facebook.com';
const WHATSAPP_TEXT_MAX_LENGTH = 4096;

function splitWhatsAppText(body, maxLength = WHATSAPP_TEXT_MAX_LENGTH) {
  const input = String(body || '');
  if (!input) {
    return [''];
  }

  if (input.length <= maxLength) {
    return [input];
  }

  const chunks = [];
  let index = 0;

  while (index < input.length) {
    let end = Math.min(index + maxLength, input.length);

    if (end < input.length) {
      const slice = input.slice(index, end);
      const breakAtNewline = slice.lastIndexOf('\n');
      const breakAtSpace = slice.lastIndexOf(' ');
      const breakAt = Math.max(breakAtNewline, breakAtSpace);

      if (breakAt > Math.floor(maxLength * 0.6)) {
        end = index + breakAt;
      }
    }

    const part = input.slice(index, end).trim();
    if (part) {
      chunks.push(part);
    }

    index = end;
    while (index < input.length && /\s/.test(input[index])) {
      index += 1;
    }
  }

  return chunks.length ? chunks : [input.slice(0, maxLength)];
}

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

function normalizeAccessToken(value) {
  const trimmed = String(value || '').trim();
  return trimmed.replace(/^Bearer\s+/i, '');
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
    accessToken: normalizeAccessToken(process.env.WHATSAPP_META_ACCESS_TOKEN),
    phoneNumberId: process.env.WHATSAPP_META_PHONE_NUMBER_ID || '',
    ownerPhone: normalizePhone(process.env.WHATSAPP_OWNER_PHONE || ''),
    timeoutMs: parseTimeout(process.env.WHATSAPP_TIMEOUT_MS),
  };
}

function parseProviderFailure(payload, status, endpoint) {
  const providerError = payload?.error;
  const providerMessage = providerError?.message || 'Meta WhatsApp API request failed';
  const providerType = providerError?.type;
  const providerCode = providerError?.code;
  const providerSubcode = providerError?.error_subcode;
  const providerDetails = providerError?.error_data?.details;
  const detailsText = [providerMessage, providerDetails].filter(Boolean).join(' ').toLowerCase();
  const isAuthOrPermissionFailure =
    status === 401 ||
    providerCode === 190 ||
    /access token|permission/.test(detailsText);

  if (isAuthOrPermissionFailure) {
    return {
      code: 'WHATSAPP_AUTH_ERROR',
      message: 'Meta WhatsApp auth failed: verify access token and app permissions',
      details: {
        endpoint,
        status,
        providerType,
        providerCode,
        providerSubcode,
        providerMessage,
        providerDetails,
        fbtraceId: providerError?.fbtrace_id,
        hint: 'Use a valid WhatsApp Cloud API token with whatsapp_business_messaging scope and ensure the phone number belongs to the same WhatsApp Business Account.',
      },
    };
  }

  return {
    code: 'WHATSAPP_PROVIDER_ERROR',
    message: providerMessage,
    details: {
      endpoint,
      status,
      providerType,
      providerCode,
      providerSubcode,
      providerMessage,
      providerDetails,
      fbtraceId: providerError?.fbtrace_id,
      raw: payload,
    },
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
  const messageChunks = splitWhatsAppText(body);
  const messageIds = [];

  try {
    let lastPayload = null;

    for (const chunk of messageChunks) {
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
            body: chunk,
          },
        }),
        signal: controller.signal,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const mapped = parseProviderFailure(payload, response.status, endpoint);
        throw new WhatsAppSendError(mapped.message, {
          code: mapped.code,
          status: response.status,
          details: {
            ...mapped.details,
            chunkCount: messageChunks.length,
            sentChunks: messageIds.length,
          },
        });
      }

      lastPayload = payload;
      const currentId = payload?.messages?.[0]?.id;
      if (currentId) {
        messageIds.push(currentId);
      }
    }

    return {
      ok: true,
      skipped: false,
      id: messageIds[0] || null,
      ids: messageIds,
      chunkCount: messageChunks.length,
      raw: lastPayload,
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
  const orderItems = Array.isArray(order.items) ? order.items : [];
  const itemCount = orderItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const itemLines = orderItems
    .map((item) => {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.price || 0);
      const lineTotal = unitPrice * quantity;
      return `- ${item.name} x${quantity} = ${order.currency} ${lineTotal.toFixed(2)}`;
    })
    .join('\n');
  const paymentMethod = String(order.paymentMethod || 'N/A').toUpperCase();

  return [
    'New QuickShop order',
    `Order: ${order.orderId}`,
    `Customer: ${customerName}`,
    `Phone: ${customerPhone}`,
    `Payment: ${paymentMethod}`,
    `Items count: ${itemCount}`,
    'Items ordered:',
    itemLines || '- N/A',
    `Total: ${order.currency} ${Number(order.total || 0).toFixed(2)}`,
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
