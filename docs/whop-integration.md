# Whop Integration

Webhook receiver validates HMAC, enforces idempotency, normalizes payload, forwards to Make.com.

---

## HMAC verification

Source: `lib/whop/verify.ts`

Headers accepted:

- `x-whop-signature`
- `whop-signature`

Signature format: `sha256=<hex>` or raw hex.
Header is trimmed and `sha256=` prefix is matched case-insensitively.

Validation logs are sanitized (path + error code only).

---

## Idempotency

Source: `lib/idempotency/check.ts`

Table:

```prisma
model WhopProcessedEvent {
  eventId       String   @id
  productSlug   String
  customerEmail String
  processedAt   DateTime @default(now())
}
```

Flow:

1. `isEventProcessed(event_id)`
2. If duplicate → return `{ received: true, duplicate: true }`
3. On success → `markEventProcessed(...)`

`markEventProcessed` ignores unique-constraint collisions so concurrent duplicates do not crash webhook.

---

## Product mapping

Source: `lib/products/product-map.ts`

Whop product IDs mapped to slugs via env vars:

- `WHOP_PRODUCT_ID_AI_AGENT_PACK`
- `WHOP_PRODUCT_ID_CLAUDE_CODE_PACK`
- `WHOP_PRODUCT_ID_DEVOPS_STARTER_KIT`
- `WHOP_PRODUCT_ID_MAKE_SCENARIO_PACK`
- `WHOP_PRODUCT_ID_WHOP_AGENCY_KIT`
- `WHOP_PRODUCT_ID_INFRA_AUDIT`
- `WHOP_PRODUCT_ID_SAAS_BOILERPLATE`
- `WHOP_PRODUCT_ID_AUTOMATION_SPEC_DOC`
- `WHOP_PRODUCT_ID_COMMUNITY`
- `WHOP_PRODUCT_ID_MANAGED_DEVOPS`
- `WHOP_PRODUCT_ID_NOTION_FOUNDER_OS`
- `WHOP_PRODUCT_ID_AUTOMATION_LAUNCH_BUNDLE`
- `WHOP_PRODUCT_ID_AGENCY_OPERATOR_BUNDLE`
- `WHOP_PRODUCT_ID_DEVELOPER_AI_TOOLKIT`

Catalog definitions: `lib/products/catalog.ts`.

---

## Make.com routing

Source: `app/api/whop/webhook/route.ts`

- Subscriptions → Scenario D
- One-time + intake → Scenario A

If Make forward fails, webhook returns `500` so Whop retries.
Forward uses a 10s timeout and cleans up abort timers.

---

## Intake order logging (Notion)

Intake orders are logged to Notion in a best-effort, non-blocking path. Failures are owner-notified and do not block webhook response.
