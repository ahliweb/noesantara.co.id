import { fetchWithRetry, readResponseBody } from '../lib/http';
import type { Env, LeadRecord, ServiceResult } from '../types';

function isMock(env: Env): boolean {
  return env.MOCK_DELIVERY === 'true';
}

export async function sendMailketingNotification(env: Env, lead: LeadRecord, requestId: string): Promise<ServiceResult> {
  if (!env.MAILKETING_API_TOKEN || !env.MAILKETING_FROM_NAME || !env.MAILKETING_FROM_EMAIL || !env.MAILKETING_RECIPIENT) {
    return { service: 'mailketing-notification', ok: false, skipped: true, detail: 'Mailketing notification env vars are incomplete.' };
  }

  if (isMock(env)) {
    return { service: 'mailketing-notification', ok: true, detail: 'Mock delivery enabled.' };
  }

  const endpoint = env.MAILKETING_NOTIFICATION_ENDPOINT || `${env.MAILKETING_API_URL || 'https://api.mailketing.co.id/api/v1'}/send`;
  const form = new URLSearchParams({
    api_token: env.MAILKETING_API_TOKEN,
    from_name: env.MAILKETING_FROM_NAME,
    from_email: env.MAILKETING_FROM_EMAIL,
    recipient: env.MAILKETING_RECIPIENT,
    subject: `[${env.ENVIRONMENT || 'production'}] Lead baru dari website`,
    content: [
      '<h2>Lead Baru Masuk</h2>',
      `<p><strong>Request ID:</strong> ${requestId}</p>`,
      `<p><strong>Nama:</strong> ${lead.name}</p>`,
      `<p><strong>WhatsApp:</strong> ${lead.whatsappDisplay}</p>`,
      `<p><strong>Email:</strong> ${lead.email ?? '-'}</p>`,
      `<p><strong>Keperluan:</strong> ${lead.purpose}</p>`,
      `<p><strong>Pesan:</strong><br>${lead.message.replace(/\n/g, '<br>')}</p>`,
      `<p><strong>Sumber:</strong> ${lead.source}</p>`,
      `<p><strong>Halaman:</strong> ${lead.pageUrl ?? '-'}</p>`,
      `<p><strong>Subscribe:</strong> ${lead.subscribeToNewsletter ? 'Ya' : 'Tidak'}</p>`,
      `<p><strong>Waktu:</strong> ${lead.submittedAt}</p>`,
    ].join(''),
  });

  const response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: form.toString(),
  }, { retries: 2, timeoutMs: 8000 });

  if (!response.ok) {
    return {
      service: 'mailketing-notification',
      ok: false,
      status: response.status,
      detail: await readResponseBody(response),
    };
  }

  return { service: 'mailketing-notification', ok: true, status: response.status };
}

export async function addMailketingSubscriber(env: Env, lead: LeadRecord): Promise<ServiceResult> {
  if (!lead.subscribeToNewsletter || !lead.email) {
    return { service: 'mailketing-subscriber', ok: true, skipped: true, detail: 'Subscription not requested.' };
  }

  if (!env.MAILKETING_API_TOKEN || !env.MAILKETING_LIST_ID) {
    return { service: 'mailketing-subscriber', ok: false, skipped: true, detail: 'Mailketing list configuration is incomplete.' };
  }

  if (isMock(env)) {
    return { service: 'mailketing-subscriber', ok: true, detail: 'Mock delivery enabled.' };
  }

  const endpoint = env.MAILKETING_SUBSCRIBE_ENDPOINT || `${env.MAILKETING_API_URL || 'https://api.mailketing.co.id/api/v1'}/addsubtolist`;
  const form = new URLSearchParams({
    api_token: env.MAILKETING_API_TOKEN,
    list_id: env.MAILKETING_LIST_ID,
    email: lead.email,
    first_name: lead.name,
    mobile: lead.whatsapp,
  });

  const response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: form.toString(),
  }, { retries: 2, timeoutMs: 8000 });

  if (!response.ok) {
    return {
      service: 'mailketing-subscriber',
      ok: false,
      status: response.status,
      detail: await readResponseBody(response),
    };
  }

  return { service: 'mailketing-subscriber', ok: true, status: response.status };
}
