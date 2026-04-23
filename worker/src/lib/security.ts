import type { Env, KVNamespace, LeadRecord } from '../types';
import { maskEmail, maskPhone } from './validation';

function splitOrigins(rawOrigins: string | undefined): string[] {
  return String(rawOrigins ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export function getAllowedOrigin(request: Request, env: Env): string | null {
  const requestOrigin = request.headers.get('Origin');
  if (!requestOrigin) return null;

  const allowedOrigins = splitOrigins(env.ALLOWED_ORIGIN);
  return allowedOrigins.includes(requestOrigin) ? requestOrigin : null;
}

export function corsHeaders(origin: string | null): HeadersInit {
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  });

  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  return headers;
}

export function jsonResponse(body: unknown, init: ResponseInit = {}, origin: string | null = null): Response {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');

  const cors = corsHeaders(origin);
  new Headers(cors).forEach((value, key) => headers.set(key, value));

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
}

export function getClientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? 'unknown';
}

export async function enforceRateLimit(request: Request, env: Env): Promise<{ ok: boolean; retryAfter?: number }> {
  const kv = env.RATE_LIMIT_KV as KVNamespace | undefined;
  if (!kv) {
    return { ok: true };
  }

  const max = Math.max(Number(env.RATE_LIMIT_MAX ?? '5'), 1);
  const windowSeconds = Math.max(Number(env.RATE_LIMIT_WINDOW_SECONDS ?? '600'), 60);
  const windowBucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const clientIp = getClientIp(request);
  const key = `lead-rate:${clientIp}:${windowBucket}`;

  const current = Number(await kv.get(key) ?? '0');
  if (current >= max) {
    return { ok: false, retryAfter: windowSeconds };
  }

  await kv.put(key, String(current + 1), { expirationTtl: windowSeconds + 30 });
  return { ok: true };
}

export function summarizeLead(lead: LeadRecord): Record<string, unknown> {
  return {
    name: lead.name,
    whatsapp: maskPhone(lead.whatsapp),
    email: maskEmail(lead.email),
    purpose: lead.purpose,
    messageLength: lead.message.length,
    source: lead.source,
    subscribeToNewsletter: lead.subscribeToNewsletter,
  };
}

export function logEvent(level: 'info' | 'warn' | 'error', message: string, metadata: Record<string, unknown> = {}): void {
  const payload = {
    level,
    message,
    ...metadata,
  };

  console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](JSON.stringify(payload));
}

export async function signPayload(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
