import { corsHeaders, enforceRateLimit, getAllowedOrigin, jsonResponse, logEvent, summarizeLead } from './lib/security';
import { validateLeadInput } from './lib/validation';
import { addMailketingSubscriber, sendMailketingNotification } from './services/mailketing';
import { sendStarsenderNotification } from './services/starsender';
import { forwardLeadWebhook } from './services/webhook';
import type { Env, LeadInput, ServiceResult } from './types';

interface ExecutionContextLike {
  waitUntil(promise: Promise<unknown>): void;
}

function configuredDeliveries(env: Env, leadHasEmail: boolean): number {
  let total = 0;
  if (env.LEAD_WEBHOOK_URL) total += 1;
  if (env.MAILKETING_API_TOKEN && env.MAILKETING_FROM_NAME && env.MAILKETING_FROM_EMAIL && env.MAILKETING_RECIPIENT) total += 1;
  if (leadHasEmail && env.MAILKETING_API_TOKEN && env.MAILKETING_LIST_ID) total += 1;
  if (env.STARSENDER_API_URL && env.STARSENDER_DEVICE_API_KEY && env.STARSENDER_SERVER_ID && env.ADMIN_WHATSAPP) total += 1;
  return total;
}

async function handleOptions(request: Request, env: Env): Promise<Response> {
  const origin = getAllowedOrigin(request, env);
  if (request.headers.get('Origin') && !origin) {
    return jsonResponse({ ok: false, error: 'Origin tidak diizinkan.' }, { status: 403 }, null);
  }

  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

async function parseJsonRequest(request: Request): Promise<LeadInput> {
  const contentLength = Number(request.headers.get('Content-Length') ?? '0');
  if (contentLength > 16_384) {
    throw new Error('Payload terlalu besar.');
  }

  return await request.json() as LeadInput;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContextLike): Promise<Response> {
    const requestId = crypto.randomUUID();
    const url = new URL(request.url);
    const origin = getAllowedOrigin(request, env);

    if (request.method === 'OPTIONS') {
      return handleOptions(request, env);
    }

    if (url.pathname !== '/api/contact') {
      return jsonResponse({ ok: false, error: 'Route tidak ditemukan.' }, { status: 404 }, origin);
    }

    if (request.headers.get('Origin') && !origin) {
      logEvent('warn', 'Blocked request from disallowed origin', { requestId, origin: request.headers.get('Origin') });
      return jsonResponse({ ok: false, error: 'Origin tidak diizinkan.' }, { status: 403 }, null);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Method tidak didukung.' }, { status: 405 }, origin);
    }

    const rateLimit = await enforceRateLimit(request, env);
    if (!rateLimit.ok) {
      return jsonResponse(
        { ok: false, error: 'Terlalu banyak percobaan. Silakan coba lagi beberapa menit lagi.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter ?? 600) } },
        origin,
      );
    }

    let input: LeadInput;

    try {
      input = await parseJsonRequest(request);
    } catch (error) {
      logEvent('warn', 'Failed to parse request body', { requestId, detail: error instanceof Error ? error.message : 'unknown' });
      return jsonResponse({ ok: false, error: 'Payload tidak valid.' }, { status: 400 }, origin);
    }

    const validation = validateLeadInput(input);
    if (validation.isBot) {
      logEvent('warn', 'Honeypot triggered', { requestId });
      return jsonResponse({ ok: true, requestId }, { status: 200 }, origin);
    }

    if (!validation.lead) {
      logEvent('warn', 'Validation failed', { requestId, detail: validation.error });
      return jsonResponse({ ok: false, error: validation.error }, { status: 400 }, origin);
    }

    const lead = validation.lead;
    logEvent('info', 'Lead request accepted', { requestId, lead: summarizeLead(lead) });

    const deliveryTasks: Promise<ServiceResult>[] = [
      forwardLeadWebhook(env, lead, requestId),
      sendMailketingNotification(env, lead, requestId),
      addMailketingSubscriber(env, lead),
      sendStarsenderNotification(env, lead, requestId),
    ];

    const results = await Promise.allSettled(deliveryTasks);
    const serviceResults = results.map((result): ServiceResult => {
      if (result.status === 'fulfilled') return result.value;
      return {
        service: 'unknown',
        ok: false,
        detail: result.reason instanceof Error ? result.reason.message : 'Unhandled service failure',
      };
    });

    const successful = serviceResults.filter((result) => result.ok).length;
    const configured = configuredDeliveries(env, Boolean(lead.email));
    const failed = serviceResults.filter((result) => !result.ok && !result.skipped);

    logEvent(failed.length > 0 ? 'warn' : 'info', 'Lead delivery completed', {
      requestId,
      configured,
      successful,
      results: serviceResults,
    });

    if (configured > 0 && successful === 0) {
      return jsonResponse(
        {
          ok: false,
          error: 'Pesan belum dapat dikirim saat ini. Silakan coba lagi atau hubungi WhatsApp resmi kami.',
          requestId,
        },
        { status: 502 },
        origin,
      );
    }
    return jsonResponse({ ok: true, requestId }, { status: 200 }, origin);
  },
};
