# Notifications & Transactional Emails

Owner alerts via Telegram. Customer delivery via Resend + React Email.

---

## Telegram alerts

Source: `lib/telegram/notify.ts`

Env vars:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_OWNER_CHAT_ID`

Behavior:

- Silent no-op if env missing
- Never throws (non-critical)

---

## Resend emails

Sources:

- `lib/resend/emails.ts`
- `lib/resend/client.ts`
- `emails/*` templates

Email types:

1. **ZIP delivery** (`sendZipDeliveryEmail`)
2. **Bundle delivery** (`sendBundleDeliveryEmail`)
3. **Intake link** (`sendIntakeLinkEmail`)
4. **PDF report delivery** (`sendPdfReportDeliveryEmail`)
5. **Subscription welcome** (`sendWelcomeEmail`)

Reply-to: `hello@rihan.cloud`
