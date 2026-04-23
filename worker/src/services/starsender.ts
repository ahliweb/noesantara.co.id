import { fetchWithRetry, readResponseBody } from '../lib/http';
import type { Env, LeadRecord, ServiceResult } from '../types';

export async function sendStarsenderNotification(env: Env, lead: LeadRecord, requestId: string): Promise<ServiceResult> {
  if (!env.STARSENDER_API_URL || !env.STARSENDER_DEVICE_API_KEY || !env.STARSENDER_SERVER_ID || !env.ADMIN_WHATSAPP) {
    return { service: 'starsender-notification', ok: false, skipped: true, detail: 'Starsender env vars are incomplete.' };
  }

  if (env.MOCK_DELIVERY === 'true') {
    return { service: 'starsender-notification', ok: true, detail: 'Mock delivery enabled.' };
  }

  const message = [
    '*Lead Baru Website NoeSantara*',
    `Request ID: ${requestId}`,
    `Nama: ${lead.name}`,
    `WhatsApp: ${lead.whatsappDisplay}`,
    `Email: ${lead.email ?? '-'}`,
    `Keperluan: ${lead.purpose}`,
    `Pesan: ${lead.message}`,
    `Sumber: ${lead.source}`,
  ].join('\n');

  const payload = {
    serverId: env.STARSENDER_SERVER_ID,
    apiKey: env.STARSENDER_DEVICE_API_KEY,
    to: env.ADMIN_WHATSAPP,
    message,
  };

  // Starsender public docs are not fully accessible without login. Keep the adapter isolated
  // so account-specific header or payload adjustments stay in one file.
  const response = await fetchWithRetry(env.STARSENDER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.STARSENDER_DEVICE_API_KEY}`,
      'X-Server-Id': env.STARSENDER_SERVER_ID,
    },
    body: JSON.stringify(payload),
  }, { retries: 2, timeoutMs: 8000 });

  if (!response.ok) {
    return {
      service: 'starsender-notification',
      ok: false,
      status: response.status,
      detail: await readResponseBody(response),
    };
  }

  return { service: 'starsender-notification', ok: true, status: response.status };
}
