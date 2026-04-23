# Starsender Integration Notes

## References Used

- Public Starsender login page: `https://starsender.online`
- Public search-accessible vendor references were used to verify that Starsender is a dashboard-driven WhatsApp gateway and that full API docs are typically behind login.
- Final authority should be the API documentation inside your Starsender account.

## Important Risk Note

Starsender is a third-party WhatsApp gateway, not Meta's official WhatsApp Business Platform. Review account policy and delivery risk before sending production traffic.

## Required Worker Secrets

- `STARSENDER_DEVICE_API_KEY`
- `STARSENDER_SERVER_ID`
- `ADMIN_WHATSAPP`

## Required Worker Vars

- `STARSENDER_API_URL`

## Implemented Behavior

- The Worker normalizes WhatsApp numbers to Indonesian `62...` format.
- A WhatsApp admin notification is sent for each valid lead.
- The adapter uses JSON plus bearer auth and includes `X-Server-Id`.

## Adjustment Point

Because public Starsender API docs are not fully available without login, the only file you should need to edit for account-specific payload or header differences is:

- `worker/src/services/starsender.ts`

## Verification Checklist

1. Confirm the exact send-message endpoint path in your Starsender dashboard.
2. Confirm whether your account expects bearer auth, form data, or custom headers.
3. Send a single staging message to a controlled admin number.
4. Confirm rate limits and messaging policy before production traffic.
