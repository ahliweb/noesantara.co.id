import { fetchWithRetry, readResponseBody } from '../lib/http';
import { signPayload } from '../lib/security';
import type { Env, LeadRecord, ServiceResult } from '../types';

export async function forwardLeadWebhook(env: Env, lead: LeadRecord, requestId: string): Promise<ServiceResult> {
  if (!env.LEAD_WEBHOOK_URL) {
    return { service: 'lead-webhook', ok: true, skipped: true, detail: 'Webhook forwarding not configured.' };
  }

  const payload = JSON.stringify({
    requestId,
    lead,
  });

  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-Request-Id': requestId,
  });

  if (env.LEAD_WEBHOOK_TOKEN) {
    headers.set('Authorization', `Bearer ${env.LEAD_WEBHOOK_TOKEN}`);
    headers.set('X-Lead-Signature', await signPayload(env.LEAD_WEBHOOK_TOKEN, payload));
  }

  const response = await fetchWithRetry(env.LEAD_WEBHOOK_URL, {
    method: 'POST',
    headers,
    body: payload,
  }, { retries: 2, timeoutMs: 10000 });

  if (!response.ok) {
    return {
      service: 'lead-webhook',
      ok: false,
      status: response.status,
      detail: await readResponseBody(response),
    };
  }

  return { service: 'lead-webhook', ok: true, status: response.status };
}
