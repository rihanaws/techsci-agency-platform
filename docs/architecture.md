# System Architecture

Autonomous Agency Platform runs two surfaces: public marketing site + fulfillment backend. All orchestration happens in Make.com, storage in R2, ops tracking in Notion.

---

## Public marketing site

Static App Router pages (Server Components by default):

- `/` landing
- `/products` catalog (client filter)
- `/products/[slug]` product detail (SSG)
- `/pricing`, `/about`, `/legal/privacy`, `/legal/terms`
- `robots.txt` + `sitemap.xml`

Catalog source of truth: `lib/marketing/products.ts`.

---

## Fulfillment flow (Whop → Make → AI → R2 → Email)

```mermaid
sequenceDiagram
  autonumber
  actor Customer
  participant Whop
  participant App as Next.js API
  participant DB as Prisma (Neon)
  participant Make as Make.com (eu1)
  participant AI as Claude (Anthropic)
  participant Doppio
  participant R2
  participant Resend
  participant Notion
  participant Telegram

  Customer->>Whop: Purchase
  Whop->>App: POST /api/whop/webhook (HMAC)
  App->>DB: Idempotency check + mark processed
  App->>Make: Scenario A / D forward

  alt ZIP or Bundle
    Make->>App: POST /api/fulfillment (type: zip)
    App->>R2: Presign download URLs
    App->>Resend: Send delivery email
    App->>Notion: Log order (fulfilled)
  else Intake
    App->>DB: Create intake token (7 days)
    Make->>Resend: Send intake link
    Customer->>App: GET /intake/[token]
    Customer->>App: POST /api/intake/submit
    App->>Make: Scenario A2
    Make->>App: POST /api/fulfillment (type: intake)
    App->>AI: Generate JSON report/spec
    App->>Doppio: HTML → PDF
    App->>R2: Upload + presign
    App->>Resend: Send report
    App->>Notion: Update status
  end

  App->>Telegram: Owner notifications
```

---

## API routes

| Endpoint | Method | Auth | Purpose |
| --- | --- | --- | --- |
| `/api/whop/webhook` | POST | Whop HMAC | Primary webhook entry |
| `/api/intake/submit` | POST | Token validated | Intake form submission |
| `/api/intake/create` | POST | `x-internal-api-key` | Internal token creation |
| `/api/fulfillment` | POST | `x-internal-api-key` | ZIP + intake fulfillment |
| `/api/r2/presign` | POST | `x-internal-api-key` | 48h download URL |
| `/api/campaign/trigger` | POST | `x-internal-api-key` | Make.com Scenario F |
| `/api/health` | GET | None | Liveness check |
