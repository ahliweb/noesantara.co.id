# Security Notes

## Controls Implemented

- No secret is exposed to Astro client code.
- Worker rejects disallowed origins using an allowlist.
- Worker enforces IP-based rate limiting using KV.
- A hidden honeypot field filters low-effort bot submissions.
- Payload size is capped before parsing.
- Server-side validation covers required fields, email format, and Indonesian WhatsApp normalization.
- All outbound calls use timeout and retry.
- Logs redact email and WhatsApp values.
- Coolify receiver requires bearer auth and HMAC signature verification.
- Frontend only receives safe success and failure messages.

## Additional Recommendations

1. Add Cloudflare Turnstile when spam volume increases.
2. Enable Cloudflare WAF and Bot Fight Mode on the API subdomain.
3. Consider per-country allow or challenge rules if abuse becomes regional.
4. Rotate vendor tokens on a schedule and after any incident.
5. If Starsender becomes business-critical, evaluate migration to Meta's official WhatsApp Business Platform.
