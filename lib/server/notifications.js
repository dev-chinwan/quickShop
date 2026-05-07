import {
  formatOrderOwnerMessage,
  getWhatsAppConfig,
  sendWhatsAppTextMessage,
} from '@/lib/server/whatsapp';

async function sendNotificationToRecipient({ role, to, body }) {
  const startedAt = Date.now();

  try {
    const result = await sendWhatsAppTextMessage({ to, body });
    return {
      role,
      ok: true,
      skipped: result.skipped,
      providerMessageId: result.id,
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      role,
      ok: false,
      skipped: false,
      errorCode: error.code || 'WHATSAPP_SEND_FAILED',
      errorMessage: error.message,
      status: error.status,
      details: error.details,
      durationMs: Date.now() - startedAt,
    };
  }
}

export async function sendOrderWhatsAppNotifications(order) {
  const config = getWhatsAppConfig();

  if (!config.enabled) {
    return {
      ok: true,
      strictMode: config.strictMode,
      skipped: true,
      results: [],
    };
  }

  const ownerPhone = config.ownerPhone;

  const jobs = [
    {
      role: 'owner',
      to: ownerPhone,
      body: formatOrderOwnerMessage(order),
    },
  ];

  const results = [];
  for (const job of jobs) {
    const result = await sendNotificationToRecipient(job);
    results.push(result);
  }

  const failures = results.filter((item) => !item.ok);

  return {
    ok: failures.length === 0,
    strictMode: config.strictMode,
    skipped: false,
    results,
    failures,
  };
}
