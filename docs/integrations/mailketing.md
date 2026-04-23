# Mailketing Integration Notes

## References Used

- Context7 was used for platform patterns where available.
- Public Mailketing endpoint references were cross-checked from current vendor search results because public API docs are not openly indexed.
- Final authority should be your authenticated Mailketing dashboard under Integration or Developer settings.

## Implemented Endpoints

- Notification email: `https://api.mailketing.co.id/api/v1/send`
- Add subscriber to list: `https://api.mailketing.co.id/api/v1/addsubtolist`

## Required Worker Secrets

- `MAILKETING_API_TOKEN`
- `MAILKETING_FROM_NAME`
- `MAILKETING_FROM_EMAIL`
- `MAILKETING_RECIPIENT`

## Optional Worker Secrets

- `MAILKETING_LIST_ID`

## Optional Worker Vars

- `MAILKETING_API_URL`
- `MAILKETING_NOTIFICATION_ENDPOINT`
- `MAILKETING_SUBSCRIBE_ENDPOINT`

## Behavior

- Every valid lead sends an admin email notification.
- If the user supplies an email and checks the subscription checkbox, the Worker attempts to add the lead to the configured Mailketing list.
- Both requests use retry with timeout.

## Verification Checklist

1. Confirm `from_email` is allowed by your Mailketing account.
2. Confirm `recipient` is the operational inbox.
3. Confirm `MAILKETING_LIST_ID` exists before enabling subscription capture.
4. Send a staging test with `MOCK_DELIVERY=false` before production cutover.

## If Your Account Docs Differ

Update only these values first:

- `MAILKETING_NOTIFICATION_ENDPOINT`
- `MAILKETING_SUBSCRIBE_ENDPOINT`
- `worker/src/services/mailketing.ts`
