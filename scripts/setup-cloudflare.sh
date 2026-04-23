#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" || -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN before running this script."
  exit 1
fi

echo "1. Create KV namespaces for rate limiting"
echo "   npx wrangler kv namespace create RATE_LIMIT_KV --config worker/wrangler.jsonc"
echo "   npx wrangler kv namespace create RATE_LIMIT_KV --config worker/wrangler.jsonc --env staging"
echo
echo "2. Update worker/wrangler.jsonc with the returned namespace IDs"
echo
echo "3. Put worker secrets for production"
for key in MAILKETING_API_TOKEN MAILKETING_FROM_NAME MAILKETING_FROM_EMAIL MAILKETING_RECIPIENT MAILKETING_LIST_ID STARSENDER_DEVICE_API_KEY STARSENDER_SERVER_ID ADMIN_WHATSAPP LEAD_WEBHOOK_URL LEAD_WEBHOOK_TOKEN; do
  echo "   printf '%s' '<value for $key>' | npx wrangler secret put $key --config worker/wrangler.jsonc"
done
echo
echo "4. Put worker secrets for staging"
for key in MAILKETING_API_TOKEN MAILKETING_FROM_NAME MAILKETING_FROM_EMAIL MAILKETING_RECIPIENT MAILKETING_LIST_ID STARSENDER_DEVICE_API_KEY STARSENDER_SERVER_ID ADMIN_WHATSAPP LEAD_WEBHOOK_URL LEAD_WEBHOOK_TOKEN; do
  echo "   printf '%s' '<value for $key>' | npx wrangler secret put $key --config worker/wrangler.jsonc --env staging"
done
echo
echo "5. Deploy the Worker"
echo "   npm run worker:deploy:staging"
echo "   npm run worker:deploy:production"
