# NoeSantara Website

Astro marketing website for `noesantara.co.id` with a production-ready contact/lead flow built for:

- Cloudflare Pages for the static frontend
- Cloudflare Workers for the secure form API
- Mailketing for admin email notifications and optional subscriber capture
- Starsender for admin WhatsApp notifications
- Coolify Managed Service for an optional lead receiver and database path
- GitHub Actions for CI/CD

## Quick Start

```bash
npm install
npm run dev
```

The contact form reads only one public environment variable:

```bash
PUBLIC_CONTACT_API_URL=https://api.noesantara.co.id/api/contact
```

## Validation

```bash
npm run validate
```

This runs:

- environment template validation
- TypeScript typecheck
- Astro production build

## Worker Local Development

```bash
cp worker/.dev.vars.example worker/.dev.vars.staging
npm run worker:dev
```

## Optional Lead Receiver

```bash
cd services/lead-receiver
npm install
npm run start
```

## Documentation

- Architecture: `docs/architecture.md`
- Cloudflare Pages and Worker setup: `docs/deployment/cloudflare-pages-worker.md`
- GitHub Actions setup: `docs/deployment/github-actions.md`
- Coolify managed service setup: `docs/deployment/coolify-managed-service.md`
- Mailketing integration notes: `docs/integrations/mailketing.md`
- Starsender integration notes: `docs/integrations/starsender.md`
- Security notes: `docs/security.md`
- Runbook and test flow: `docs/runbooks/contact-form-lead-flow.md`
