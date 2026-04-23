import { createServer } from 'node:http';
import crypto from 'node:crypto';
import { URL } from 'node:url';
import { Pool } from 'pg';

const PORT = Number(process.env.PORT || '3000');
const NODE_ENV = process.env.NODE_ENV || 'production';
const WEBHOOK_AUTH_TOKEN = process.env.WEBHOOK_AUTH_TOKEN || '';
const DATABASE_URL = process.env.DATABASE_URL || '';

const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
      max: 5,
      idleTimeoutMillis: 10_000,
    })
  : null;

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function maskEmail(value) {
  if (!value) return null;
  const [name, domain] = String(value).split('@');
  if (!name || !domain) return '***';
  return `${name.slice(0, 2)}***@${domain}`;
}

function maskPhone(value) {
  const text = String(value || '');
  if (text.length < 6) return '***';
  return `${text.slice(0, 4)}***${text.slice(-3)}`;
}

function log(level, message, metadata = {}) {
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  fn(JSON.stringify({ level, message, ...metadata }));
}

function timingSafeMatch(a, b) {
  const first = Buffer.from(a || '');
  const second = Buffer.from(b || '');
  if (first.length !== second.length || first.length === 0) return false;
  return crypto.timingSafeEqual(first, second);
}

async function verifySignature(body, signature) {
  if (!WEBHOOK_AUTH_TOKEN || !signature) return false;
  const expected = crypto.createHmac('sha256', WEBHOOK_AUTH_TOKEN).update(body).digest('hex');
  return timingSafeMatch(expected, signature);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > 32768) {
      throw new Error('Payload terlalu besar.');
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
}

function validateLeadEnvelope(payload) {
  const lead = payload?.lead;
  if (!payload?.requestId || !lead?.name || !lead?.whatsapp || !lead?.purpose || !lead?.message) {
    return { ok: false, error: 'Payload lead tidak lengkap.' };
  }

  return { ok: true, lead };
}

async function storeLead(payload) {
  if (!pool) {
    return { ok: true, skipped: true };
  }

  const lead = payload.lead;
  await pool.query(
    `
      INSERT INTO public.website_leads (
        id,
        request_id,
        name,
        whatsapp,
        email,
        purpose,
        message,
        source,
        page_url,
        subscribe_to_newsletter,
        submitted_at,
        raw_payload
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (request_id) DO NOTHING
    `,
    [
      crypto.randomUUID(),
      payload.requestId,
      lead.name,
      lead.whatsapp,
      lead.email,
      lead.purpose,
      lead.message,
      lead.source,
      lead.pageUrl,
      Boolean(lead.subscribeToNewsletter),
      lead.submittedAt,
      payload,
    ],
  );

  return { ok: true };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return json(res, 200, {
      ok: true,
      service: 'lead-receiver',
      environment: NODE_ENV,
      database: Boolean(pool),
    });
  }

  if (req.method !== 'POST' || url.pathname !== '/api/leads') {
    return json(res, 404, { ok: false, error: 'Route tidak ditemukan.' });
  }

  if (!WEBHOOK_AUTH_TOKEN) {
    log('error', 'Lead receiver rejected request because WEBHOOK_AUTH_TOKEN is missing');
    return json(res, 500, { ok: false, error: 'Server belum terkonfigurasi.' });
  }

  const authHeader = req.headers.authorization || '';
  const signature = req.headers['x-lead-signature'];
  const suppliedToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!timingSafeMatch(WEBHOOK_AUTH_TOKEN, suppliedToken)) {
    return json(res, 401, { ok: false, error: 'Unauthorized.' });
  }

  let rawBody = '';
  try {
    rawBody = await readBody(req);
  } catch (error) {
    return json(res, 413, { ok: false, error: error instanceof Error ? error.message : 'Payload tidak valid.' });
  }

  const isValidSignature = await verifySignature(rawBody, Array.isArray(signature) ? signature[0] : signature);
  if (!isValidSignature) {
    return json(res, 401, { ok: false, error: 'Signature tidak valid.' });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json(res, 400, { ok: false, error: 'JSON tidak valid.' });
  }

  const validation = validateLeadEnvelope(payload);
  if (!validation.ok) {
    return json(res, 400, { ok: false, error: validation.error });
  }

  try {
    await storeLead(payload);
    log('info', 'Lead stored or accepted', {
      requestId: payload.requestId,
      whatsapp: maskPhone(validation.lead.whatsapp),
      email: maskEmail(validation.lead.email),
      purpose: validation.lead.purpose,
      database: Boolean(pool),
    });
    return json(res, 202, { ok: true, requestId: payload.requestId });
  } catch (error) {
    log('error', 'Failed to store lead', {
      requestId: payload.requestId,
      detail: error instanceof Error ? error.message : 'unknown',
    });
    return json(res, 500, { ok: false, error: 'Gagal menyimpan lead.' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  log('info', 'Lead receiver started', { port: PORT, environment: NODE_ENV, database: Boolean(pool) });
});

process.on('SIGTERM', async () => {
  if (pool) {
    await pool.end().catch(() => null);
  }
  server.close(() => process.exit(0));
});
