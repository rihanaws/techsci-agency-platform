# Whop Commerce Integration

This document describes how the platform securely integrates with Whop.com to process product checkout webhooks.

---

## 🔒 HMAC Webhook Signature Verification

To ensure that incoming HTTP requests originate exclusively from Whop and have not been tampered with in transit, the platform validates the signature header `x-whop-signature`.

The verification logic is located in [lib/whop/verify.ts](file:///Users/rihan/all-coding-project/techsci-agency-platform/lib/whop/verify.ts).

### How it Works
1. When a webhook is sent, Whop computes an HMAC-SHA256 signature of the raw JSON request body using the configured **Webhook Client Secret** as the key.
2. The signature is sent in the header as:
   `x-whop-signature: sha256=12345abcdef...` or just `12345abcdef...`
3. Next.js extracts the raw text body of the request (not the parsed JSON) and computes its own HMAC-SHA256 signature using `process.env.WHOP_WEBHOOK_SECRET`.
4. It compares the two hashes using a timing-attack safe comparison algorithm.

```typescript
import { createHmac, timingSafeEqual } from 'crypto'

export function verifyWhopSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !secret) return false

  const cleanSignature = signatureHeader.startsWith('sha256=')
    ? signatureHeader.slice(7)
    : signatureHeader

  const computedHex = createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  const expectedBuffer = Buffer.from(cleanSignature, 'hex')
    .slice(0, 64) // Clamp to max hash length
  const computedBuffer = Buffer.from(computedHex, 'hex')

  if (expectedBuffer.length !== computedBuffer.length) {
    return false
  }

  return timingSafeEqual(expectedBuffer, computedBuffer)
}
```

---

## 🔁 Idempotency Checking

To prevent double-deliveries, duplicate Notion rows, or race conditions caused by network retries (e.g. Whop resending a webhook if the response is delayed), the platform implements strict idempotency handling.

The implementation is located in [lib/idempotency/check.ts](file:///Users/rihan/all-coding-project/techsci-agency-platform/lib/idempotency/check.ts).

### Database Model (`prisma/schema.prisma`)
We register every processed event ID in a dedicated SQLite/PostgreSQL table:
```prisma
model WhopProcessedEvent {
  eventId   String   @id @map("event_id")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("whop_processed_events")
}
```

### Execution Flow
1. Next.js receives a validated webhook payload.
2. It extracts `event_id` from the payload.
3. It runs a transaction to insert the `event_id` into `whop_processed_events`.
4. If the database raises a **unique constraint violation** (P2002), the platform immediately returns a `200 OK` response to Whop, terminating the execution because the event has already been processed.
5. If the insert succeeds, the fulfillment pipeline proceeds.

---

## 📊 Event Normalization & Catalog Mapping

Whop webhook payloads can vary depending on the event trigger type. The platform normalizes various payload types (such as `payment.succeeded` memberships or checkouts) into a unified TS interface: `NormalizedPurchase`.

Normalization logic is defined in [lib/whop/normalize.ts](file:///Users/rihan/all-coding-project/techsci-agency-platform/lib/whop/normalize.ts).

### Product Catalog Mapping
We translate Whop Product IDs to human-readable **Product Slugs** defined in [lib/products/catalog.ts](file:///Users/rihan/all-coding-project/techsci-agency-platform/lib/products/catalog.ts) using environment variables.

| Environment Variable | Product Slug | Fulfillment Mode |
| :--- | :--- | :--- |
| `WHOP_PRODUCT_ID_AI_AGENT_PACK` | `ai-agent-pack` | ZIP Delivery |
| `WHOP_PRODUCT_ID_MAKE_SCENARIO_PACK` | `make-scenario-pack` | ZIP Delivery |
| `WHOP_PRODUCT_ID_INFRA_AUDIT` | `infra-audit` | Intake Form (Claude Report) |
| `WHOP_PRODUCT_ID_AUTOMATION_SPEC_DOC` | `automation-spec-doc` | Intake Form (Claude Report) |
| `WHOP_PRODUCT_ID_COMMUNITY` | `community` | Onboarding Welcome |

This loose mapping decouples the core logic from specific Whop environment IDs, allowing developers to rotate or deploy new Whop digital products without rewriting backend code.
