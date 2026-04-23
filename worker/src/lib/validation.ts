import type { LeadInput, LeadRecord } from '../types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeText(value: unknown, maxLength: number): string {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function normalizeIndonesianWhatsapp(rawValue: unknown): { normalized: string; display: string } | null {
  const digits = String(rawValue ?? '').replace(/[^\d+]/g, '').trim();
  if (!digits) return null;

  let normalized = digits;

  if (normalized.startsWith('+')) {
    normalized = normalized.slice(1);
  }

  if (normalized.startsWith('0')) {
    normalized = `62${normalized.slice(1)}`;
  } else if (normalized.startsWith('8')) {
    normalized = `62${normalized}`;
  }

  if (!normalized.startsWith('62')) {
    return null;
  }

  if (!/^62\d{8,14}$/.test(normalized)) {
    return null;
  }

  return {
    normalized,
    display: `+${normalized}`,
  };
}

export function validateLeadInput(input: LeadInput): { lead?: LeadRecord; error?: string; isBot?: boolean } {
  const honeypot = sanitizeText(input.honeypot, 200);
  if (honeypot) {
    return { isBot: true };
  }

  const name = sanitizeText(input.name, 120);
  const purpose = sanitizeText(input.purpose, 120);
  const message = sanitizeText(input.message, 4000);
  const email = sanitizeText(input.email, 200).toLowerCase();
  const source = sanitizeText(input.source, 120) || 'website-contact-form';
  const pageUrl = sanitizeText(input.pageUrl, 500) || null;
  const whatsapp = normalizeIndonesianWhatsapp(input.whatsapp);

  if (!name) return { error: 'Nama lengkap wajib diisi.' };
  if (!whatsapp) return { error: 'Nomor WhatsApp wajib menggunakan format Indonesia yang valid.' };
  if (!purpose) return { error: 'Keperluan wajib diisi.' };
  if (!message) return { error: 'Pesan wajib diisi.' };
  if (email && !EMAIL_PATTERN.test(email)) return { error: 'Format email tidak valid.' };

  return {
    lead: {
      name,
      whatsapp: whatsapp.normalized,
      whatsappDisplay: whatsapp.display,
      email: email || null,
      purpose,
      message,
      subscribeToNewsletter: Boolean(input.subscribeToNewsletter),
      pageUrl,
      source,
      submittedAt: new Date().toISOString(),
    },
  };
}

export function maskEmail(value: string | null): string | null {
  if (!value) return null;
  const [name, domain] = value.split('@');
  if (!name || !domain) return '***';
  return `${name.slice(0, 2)}***@${domain}`;
}

export function maskPhone(value: string): string {
  if (value.length < 6) return '***';
  return `${value.slice(0, 4)}***${value.slice(-3)}`;
}
