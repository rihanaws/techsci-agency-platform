# System Architecture

The TechSci Agency Platform is designed to operate fully autonomously. It functions as a secure integration middleware bridge connecting commerce channels (Whop), backend database engines (Prisma on Neon), operations tracking boards (Notion), AI models (Claude Sonnet), PDF generation microservices (Doppio), object storage (Cloudflare R2), and notification dispatches (Resend & Telegram).

---

## 🛠️ Pipeline Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Whop as Whop Commerce
    participant App as Next.js Platform
    participant DB as Prisma (Neon DB)
    participant Notion as Notion Orders DB
    participant Make as Make.com (eu1)
    participant AI as Claude (Anthropic)
    participant Doppio as Doppio PDF
    participant R2 as Cloudflare R2
    participant Resend as Resend (Email)
    participant Telegram as Telegram (Owner)

    Customer->>Whop: Purchase Product
    Whop->>App: POST /api/whop/webhook (Signed Payload)
    Note over App: 1. Verify HMAC Signature<br/>2. Validate Event JSON (Zod)<br/>3. Check Idempotency (Prisma)
    App->>DB: Check & Insert Processed Event ID
    Note over App: If Already Processed, exit 200

    alt ZIP Digital Product (e.g. AI Agent Pack)
        App->>Make: Forward Event to Scenario A
        Make->>App: POST /api/fulfillment (type: 'zip')
        App->>Notion: Log Order (status: 'fulfilled')
        App->>R2: Generate 48h Presigned Download Link
        App->>Resend: Dispatch Download Email
        App->>Telegram: Send Delivery Notification
    else Intake-Based Service (e.g. Infrastructure Audit)
        App->>DB: Generate Intake Token (7-day TTL)
        App->>Notion: Log Order (status: 'awaiting_intake')
        App->>Make: Forward Event to Scenario A (with token)
        Make->>Resend: Email Intake Form Link
        Customer->>App: GET /intake/{token} (Form Page)
        Customer->>App: Submit Questionnaire Form
        App->>DB: Mark Token as Used / Expired
        App->>Make: Forward Form Data to Scenario A2
        Make->>App: POST /api/fulfillment (type: 'intake')
        App->>AI: Generate Audit/Spec JSON (Claude)
        App->>Doppio: Render PDF from Custom HTML Template
        App->>R2: Upload PDF Buffer to Bucket
        App->>Notion: Update Order (status: 'fulfilled')
        App->>Resend: Dispatch Report Delivery Email (48h PDF link)
        App->>Telegram: Send Fulfillment Notification
    end
```

---

## 🌐 API Route Specifications

All internal fulfillment and utility endpoints are guarded by a shared secure credential token key passed via the `x-internal-api-key` header.

| Endpoint | Method | Authentication | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/whop/webhook` | `POST` | Whop HMAC Header | Primary webhook listener for Whop memberships and payment events. |
| `/api/intake/submit` | `POST` | None (Token Validated) | Receives customer intake form submissions, marks the token as used, and forwards payloads. |
| `/api/intake/create` | `POST` | `x-internal-api-key` | Programmatic creation of custom intake tokens (for manual overrides). |
| `/api/fulfillment` | `POST` | `x-internal-api-key` | Core fulfillment engine orchestrating Claude, Doppio, R2, Notion, and email dispatches. |
| `/api/r2/presign` | `POST` | `x-internal-api-key` | Generates 48-hour secure pre-signed download URLs for specific R2 object keys. |
| `/api/campaign/trigger` | `POST` | User Session (Admin Only) | Server action gateway triggering Make.com Scenario F campaigns. |
| `/api/health` | `GET` | None | System status and database latency checker. |
```
