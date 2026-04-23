# Cloudflare Pages And Worker Setup

## Official References Used

- Astro env variable guidance: `https://docs.astro.build/en/guides/environment-variables/`
- Cloudflare Pages build configuration: `https://developers.cloudflare.com/pages/configuration/build-configuration/`
- Cloudflare Pages direct upload in CI: `https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/`
- Cloudflare Worker secrets and Wrangler config: `https://developers.cloudflare.com/workers/configuration/secrets/` and `https://developers.cloudflare.com/workers/wrangler/configuration/`

## Pages Configuration

- Framework preset: `Astro`
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`
- Staging branch: `staging`

## Pages Environment Variables

- `PUBLIC_CONTACT_API_URL=https://api.noesantara.co.id/api/contact` for production
- `PUBLIC_CONTACT_API_URL=https://api-staging.noesantara.co.id/api/contact` for staging

## Worker Domain Recommendation

- Production: `api.noesantara.co.id`
- Staging: `api-staging.noesantara.co.id`

Using a dedicated API subdomain keeps CORS simple and prevents route collisions with Pages.

## Worker Variables

Non-secret vars in `worker/wrangler.jsonc`:

- `ENVIRONMENT`
- `ALLOWED_ORIGIN`
- `RATE_LIMIT_MAX`
- `RATE_LIMIT_WINDOW_SECONDS`
- `MAILKETING_API_URL`
- `MAILKETING_NOTIFICATION_ENDPOINT`
- `MAILKETING_SUBSCRIBE_ENDPOINT`
- `STARSENDER_API_URL`
- `MOCK_DELIVERY`

Secret vars in Cloudflare Secrets:

- `MAILKETING_API_TOKEN`
- `MAILKETING_FROM_NAME`
- `MAILKETING_FROM_EMAIL`
- `MAILKETING_RECIPIENT`
- `MAILKETING_LIST_ID`
- `STARSENDER_DEVICE_API_KEY`
- `STARSENDER_SERVER_ID`
- `ADMIN_WHATSAPP`
- `LEAD_WEBHOOK_URL`
- `LEAD_WEBHOOK_TOKEN`

## Rate Limit KV

Create one KV namespace per environment and place the IDs into `worker/wrangler.jsonc`.

```bash
npx wrangler kv namespace create RATE_LIMIT_KV --config worker/wrangler.jsonc
npx wrangler kv namespace create RATE_LIMIT_KV --config worker/wrangler.jsonc --env staging
```

## Local Development

1. Copy `worker/.dev.vars.example` to `worker/.dev.vars.staging`.
2. Fill the credentials.
3. Run `npm run worker:dev`.

## Deployment

```bash
npm run worker:deploy:staging
npm run worker:deploy:production
```

Or let GitHub Actions handle deployments on push.
