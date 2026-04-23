# Contact Lead Architecture

## Recommendation

- Keep the Astro marketing site on Cloudflare Pages.
- Add a dedicated Cloudflare Worker on `api.noesantara.co.id` for all contact submissions.
- Forward validated leads to an optional Coolify-managed receiver service for persistence and downstream orchestration.
- Send admin email via Mailketing and admin WhatsApp via Starsender from the Worker.

## Assumptions

- The production site stays on `https://noesantara.co.id`.
- A staging site is available on `https://staging.noesantara.co.id` or a similar preview hostname.
- Cloudflare Pages and Worker deployments are managed from GitHub Actions.
- Coolify is already available as a managed platform from `coolify.io`; this repo does not install or self-host Coolify.

## Traffic Flow

1. User submits the Astro form on `/kontak`.
2. Browser sends JSON to `PUBLIC_CONTACT_API_URL`.
3. Cloudflare Worker validates the payload, checks CORS, rate limits by IP via KV, and ignores honeypot spam.
4. Worker forwards the lead to the optional Coolify receiver.
5. Worker sends admin notification email via Mailketing.
6. Worker sends admin WhatsApp notification via Starsender.
7. Worker returns a safe JSON response to the browser.

## Risk Analysis

- Vendor API drift: Mailketing and Starsender public docs are limited, so both integrations are isolated in adapter files.
- Partial delivery: one downstream may fail while another succeeds. The Worker logs per-service results and only fails the request if every configured delivery fails.
- Abuse: the form is internet-facing, so the implementation uses CORS allowlists, a honeypot, payload size limits, and KV-based rate limiting.
- Secrets exposure: no delivery secret is referenced in Astro client code.

## Security Notes

- Only `PUBLIC_CONTACT_API_URL` is exposed to the client.
- Worker secrets stay in Cloudflare Secrets.
- Coolify receiver access is protected with bearer auth plus HMAC signature verification.
- Logs redact phone and email values.

## Deployment Flow

1. Push to `staging` deploys staging Pages assets and the staging Worker.
2. Push to `main` deploys production Pages assets and the production Worker.
3. Coolify-managed lead receiver is deployed separately and referenced by `LEAD_WEBHOOK_URL`.

## Rollback Strategy

- Pages: redeploy the previous successful Pages artifact or revert the commit and re-run `Deploy Pages`.
- Worker: deploy the previous Git commit or use the Cloudflare dashboard to roll back the Worker version.
- Coolify receiver: redeploy the last healthy image or previous Git revision, keeping the same `WEBHOOK_AUTH_TOKEN`.
