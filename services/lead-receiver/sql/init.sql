CREATE TABLE IF NOT EXISTS public.website_leads (
  id UUID PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NULL,
  purpose TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT NOT NULL,
  page_url TEXT NULL,
  subscribe_to_newsletter BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL,
  raw_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS website_leads_created_at_idx ON public.website_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS website_leads_whatsapp_idx ON public.website_leads (whatsapp);
CREATE INDEX IF NOT EXISTS website_leads_email_idx ON public.website_leads (email);
