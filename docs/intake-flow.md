# Customer Intake Flow

Intake products use single-use tokens stored in Postgres and verified before rendering `app/intake/[token]`.

---

## Token model

Source: `prisma/schema.prisma`

```prisma
model WhopIntakeToken {
  id            String    @id @default(cuid())
  token         String    @unique @default(uuid())
  eventId       String    @unique
  productSlug   String
  customerEmail String
  customerName  String
  usedAt        DateTime?
  expiresAt     DateTime
  createdAt     DateTime  @default(now())
}
```

Rules:

- **TTL**: 7 days from creation
- **Single use**: `usedAt` set on successful submit
- **Expired**: `expiresAt < now` → blocked

---

## Creation flow

1. Whop webhook identifies intake product.
2. `generateIntakeToken()` creates UUID token.
3. Token stored with `expiresAt`.
4. Email link: `https://agency.rihan.cloud/intake/{token}`.

On DB failure, `generateIntakeToken()` throws `IntakeTokenError` and webhook returns `500` so Whop retries.

---

## Intake UI

Server page: `app/intake/[token]/page.tsx`  
Client form: `app/intake/[token]/IntakeForm.tsx`

### `infra-audit`

- Server Type (VPS / managed / serverless / bare metal)
- Cloud Provider
- OS & version
- Running services
- Cloudflare usage
- SSL provider
- Monitoring stack
- Biggest concern
- Notes (optional)

### `automation-spec-doc`

- Process name
- Manual steps
- Tools involved
- Trigger type
- Expected volume
- Output type
- Notes (optional)

### `managed-devops`

- Server endpoints
- UptimeRobot API key (optional)
- Better Stack API key (optional)
- Alert email
- SSL domains
- Special instructions (optional)

---

## Submission flow

Endpoint: `app/api/intake/submit/route.ts`

1. Zod validates payload.
2. Token validated via `validateIntakeToken()`.
3. Make.com Scenario A2 receives payload (bounded retry with backoff on failure).
4. Token marked used via `markTokenUsed()` only after successful forward.
