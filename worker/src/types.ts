export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface Env {
  ENVIRONMENT?: string;
  ALLOWED_ORIGIN?: string;
  RATE_LIMIT_MAX?: string;
  RATE_LIMIT_WINDOW_SECONDS?: string;
  MOCK_DELIVERY?: string;
  MAILKETING_API_URL?: string;
  MAILKETING_NOTIFICATION_ENDPOINT?: string;
  MAILKETING_SUBSCRIBE_ENDPOINT?: string;
  MAILKETING_API_TOKEN?: string;
  MAILKETING_FROM_NAME?: string;
  MAILKETING_FROM_EMAIL?: string;
  MAILKETING_RECIPIENT?: string;
  MAILKETING_LIST_ID?: string;
  STARSENDER_API_URL?: string;
  STARSENDER_DEVICE_API_KEY?: string;
  STARSENDER_SERVER_ID?: string;
  ADMIN_WHATSAPP?: string;
  LEAD_WEBHOOK_URL?: string;
  LEAD_WEBHOOK_TOKEN?: string;
  RATE_LIMIT_KV?: KVNamespace;
}

export interface LeadInput {
  name: string;
  whatsapp: string;
  email?: string;
  purpose: string;
  message: string;
  honeypot?: string;
  subscribeToNewsletter?: boolean;
  pageUrl?: string;
  source?: string;
}

export interface LeadRecord {
  name: string;
  whatsapp: string;
  whatsappDisplay: string;
  email: string | null;
  purpose: string;
  message: string;
  subscribeToNewsletter: boolean;
  pageUrl: string | null;
  source: string;
  submittedAt: string;
}

export interface ServiceResult {
  service: string;
  ok: boolean;
  skipped?: boolean;
  status?: number;
  detail?: string;
}
