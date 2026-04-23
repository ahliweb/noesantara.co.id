# Contact Form Lead Flow Runbook

## Test Checklist

1. Open `/kontak` on local or staging.
2. Submit a valid form.
3. Confirm the browser shows a success message.
4. Confirm Worker logs show request received, webhook result, Mailketing result, and Starsender result.
5. Confirm the admin mailbox receives the Mailketing notification.
6. Confirm the admin WhatsApp number receives the Starsender message.
7. If the Coolify receiver is enabled, confirm the lead appears in PostgreSQL.

## Failure Modes

- `400`: validation failed.
- `403`: origin blocked.
- `429`: rate limit triggered.
- `502`: all configured downstream deliveries failed.

## Troubleshooting

- If the frontend fails immediately, verify `PUBLIC_CONTACT_API_URL`.
- If CORS fails, verify `ALLOWED_ORIGIN` in the Worker environment.
- If email fails, verify Mailketing token, sender identity, and endpoint path.
- If WhatsApp fails, verify Starsender endpoint, API key, and server ID.
- If the webhook fails, verify `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_TOKEN`, and Coolify app health.

## Observability Guidance

Look for these log events in Cloudflare Worker logs:

- `Lead request accepted`
- `Validation failed`
- `Lead delivery completed`

Look for these log events in the Coolify receiver logs:

- `Lead receiver started`
- `Lead stored or accepted`
- `Failed to store lead`
