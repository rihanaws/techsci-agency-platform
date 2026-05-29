# Autonomous Agency Master Plan v4 — Rihan Consulting × TechSci Inc

> **Stack**: Next.js 15 + Bun + Make.com + Whop + Cloudflare R2 + Canva API + Claude (`claude-sonnet-4-20250514`)
> **Constraint**: Zero-human fulfillment after setup.
> **Entity note**: Rihan Consulting is not described as a US corporation. US entity references attach only to TechSci Inc or Royal Soft LLC where legally accurate.
> **Make.com org**: TechSci (ID: 7648427) · Team: My Team (ID: 1695253) · Zone: eu1.make.com

---

## v4 Changes from v3

| # | Gap fixed | Change |
|---|---|---|
| 1 | Make webhook URLs (1 var → 4) | 4 separate env vars: A, A2, D, F |
| 2 | `forwardToMake()` routing-unaware | Route resolves URL first, passes to forwarder |
| 3 | Idempotency implementation undefined | Locked to **Prisma on Neon** (`WhopProcessedEvent` model) |
| 4 | Product catalog slug coverage (8 of 14) | All 14 slugs in catalog + product-map |
| 5 | Mark-before vs mark-after | **Mark after successful Make forward** (allows Whop retry on Make down) |
| 6 | Model string inconsistency | `claude-sonnet-4-20250514` everywhere |
| 7 | Signature header fallback missing | Both `x-whop-signature` and `whop-signature` checked |
| 8 | Claude system prompt in wrong field | Separate `system` parameter used |
| 9 | **Tally replaced** | Built-in Next.js intake form at `/intake/[token]` |
| 10 | `notion-founder-os` type ambiguity | ZIP delivery confirmed |
| 11 | Missing env vars | Full env list consolidated below |
| 12 | Deployment target | **Vercel primary** (Cloudflare Pages dropped) |
| 13 | Bundle email template | `bundle-delivery.tsx` added with `urls: string[]` prop |
| 14 | No `whopProductId` in catalog | Documented as separate env-var lookup (no catalog field) |
| 15 | Event type filter incomplete | `HANDLED_EVENTS` includes `payment.succeeded` + `membership.went_valid` |
| 16 | GitHub invite unresolvable | `saas-boilerplate` → R2 ZIP for all of Week 1 |
| 17 | Admin panel not in build sequence | Added to Week 1 Day 3–4, 4h estimate |
| 18 | Copilot instructions filename | Must be `.github/copilot-instructions.md` (no version suffix) |

---

## Repo Analysis: `rihanaws/agency-agents-full`

Fork of [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) — MIT-licensed, 144+ specialized AI agent files. Covers Engineering (28), Marketing (31), Sales (9), Design (8), Finance (5), Testing (8), Product/PM/Support (~17), Game Dev (20+), Specialized (40+).

Ships `install.sh` + `convert.sh` supporting Claude Code, Copilot, Cursor, Windsurf, Aider, Gemini CLI, OpenCode, OpenClaw, Qwen, Kimi.

This repo **is** the AI Agent Pack content. ZIP is assembled from it. No content creation required — curation + packaging only. MIT license allows commercial use without attribution requirement.

---

## Phase 1: Product Catalog (Final, v4)

### Full Product Catalog

| # | Product | Price | Branch slug | Fulfillment type |
|---|---|---|---|---|
| 1 | AI Agent Pack — Full Library | $49 | `ai-agent-pack` | ZIP |
| 2 | Claude Code Agent Pack | $79 | `claude-code-agent-pack` | ZIP |
| 3 | DevOps Starter Kit | $59 | `devops-starter-kit` | ZIP |
| 4 | Make.com Automation Scenario Pack | $79 | `make-scenario-pack` | ZIP |
| 5 | Whop Agency Setup Kit | $99 | `whop-agency-kit` | ZIP |
| 6 | AI-Generated IT Infrastructure Audit | $99 | `infra-audit` | Intake form |
| 7 | Next.js 15 SaaS Boilerplate | $149 | `saas-boilerplate` | ZIP |
| 8 | Automation Spec Doc | $59 | `automation-spec-doc` | Intake form |
| 9 | Autonomous Founder Systems Community | $29/mo | `community` | Subscription |
| 10 | Managed DevOps Monthly Report | $199/mo | `managed-devops` | Subscription-intake |
| 11 | Notion Founder OS Template | $29 | `notion-founder-os` | ZIP |

### Bundles

| Bundle | Price | Slug | Assets |
|---|---|---|---|
| Automation Launch Bundle | $249 ($199 launch 48h) | `automation-launch-bundle` | SaaS Boilerplate + AI Agent Pack + Make Pack + DevOps Kit |
| Agency Operator Bundle | $149 | `agency-operator-bundle` | Whop Agency Kit + Make Pack + AI Agent Pack |
| Developer AI Toolkit | $129 ($99 launch 48h) | `developer-ai-toolkit` | Claude Code Pack + DevOps Kit + SaaS Boilerplate |

### Lead Magnet

- **AI Agent Pack — Lite**: $0 / PWYW ($0–$5), 10 agents (1 per domain), Whop marketplace indexed → triggers Scenario C

### Excluded

| Item | Reason |
|---|---|
| AI Automation Retainer | Repositioned as Automation Spec Doc ($59) |
| SaaS Build & Scale $2,500 | Manual consulting via TechSci Inc direct inquiry only |
| Managed DevOps | Launch-gated until Scenario D tested end-to-end |
| GitHub collaborator invite | Unresolvable without username capture — deferred post-Week 1 |

---

## Key Architecture Decision: Intake Forms (Replaces Tally)

**No Tally subscription required.** All intake forms are built into the Next.js app.

### Intake Flow

```
Purchase (infra-audit / automation-spec-doc / managed-devops)
  ↓
Next.js webhook handler generates UUID intake token
  ↓
Stores token → Neon DB (WhopIntakeToken table)
  ↓
Passes intakeToken in normalized payload to Make
  ↓
Make Scenario A emails customer: "Complete your intake at https://agency.rihan.cloud/intake/{token}"
  ↓
Customer fills branded form at /intake/[token]
  ↓
/api/intake/submit validates token → marks used → forwards to Make Scenario A2
  ↓
Make Scenario A2: Claude → PDF → R2 → Resend delivery → Notion update
```

### New Routes Required

```
app/
├── intake/
│   └── [token]/
│       └── page.tsx          ← Branded intake form (infra-audit OR automation-spec fields based on product)
└── api/
    └── intake/
        ├── create/
        │   └── route.ts      ← Called by Next.js webhook handler internally
        └── submit/
            └── route.ts      ← Validates token, forwards to Make A2, marks token used
```

### Intake Token Prisma Model

```prisma
model WhopIntakeToken {
  id            String   @id @default(cuid())
  token         String   @unique @default(uuid())
  eventId       String   @unique  // FK to WhopProcessedEvent
  productSlug   String
  customerEmail String
  customerName  String
  usedAt        DateTime?
  expiresAt     DateTime  // 7 days from creation
  createdAt     DateTime @default(now())

  @@index([token])
  @@index([expiresAt])
  @@map("whop_intake_tokens")
}
```

### Intake Form Fields by Product

**`infra-audit`**:
- Server type (VPS / managed / serverless)
- Cloud provider (Hetzner / AWS / DigitalOcean / other)
- OS + version
- Running services (free text)
- Cloudflare in use? (yes/no)
- SSL provider
- Current monitoring (none / UptimeRobot / Better Stack / other)
- Biggest concern (security / uptime / cost / performance)
- Additional notes

**`automation-spec-doc`**:
- Process name
- Current manual steps (free text)
- Apps/tools involved (free text)
- Trigger type (webhook / schedule / manual / email)
- Expected volume (# per day)
- Output required (email / Notion entry / PDF / Slack message / other)
- Additional notes

**`managed-devops`** (onboarding):
- Server endpoint(s) to monitor
- UptimeRobot API key (optional)
- Better Stack API key (optional)
- Alert email
- SSL domain(s) to check
- Special instructions

---

## Phase 2: Make.com Scenario Blueprints

### Blueprint Standard

- Build in Make UI with live credentials → export real JSON
- org: TechSci (7648427), team: My Team (1695253), zone: eu1.make.com
- Every scenario: `X-Internal-Webhook-Secret` on inbound webhooks, Notion as operational truth, 48h R2 presigned URLs, Resend transactional email, Telegram owner loop, idempotency in Next.js before Make

### Scenario A: Purchase → Instant Delivery

**Trigger**: Custom webhook `whop_purchase_received`
**Make webhook URL env var**: `MAKE_WEBHOOK_URL_SCENARIO_A`

Router branches (first match wins):

| Branch | Slug | Fulfillment |
|---|---|---|
| 1 | `ai-agent-pack` | R2 presign → Resend `delivery.tsx` → Notion log |
| 2 | `claude-code-agent-pack` | R2 presign → Resend `delivery.tsx` (with install.sh note) → Notion log |
| 3 | `devops-starter-kit` | R2 presign → Resend `delivery.tsx` → Notion log |
| 4 | `make-scenario-pack` | R2 presign → Resend `delivery.tsx` → Notion log |
| 5 | `whop-agency-kit` | R2 presign → Resend `delivery.tsx` → Notion log |
| 6 | `infra-audit` | Resend `intake-link.tsx` (with `intakeToken`) → Notion `awaiting_intake` |
| 7 | `saas-boilerplate` | R2 presign → Resend `delivery.tsx` → Notion log |
| 8 | `automation-spec-doc` | Resend `intake-link.tsx` (with `intakeToken`) → Notion `awaiting_intake` |
| 9 | `community` | Resend `welcome.tsx` → Brevo add to list → Notion log |
| 10 | `managed-devops` | Resend `intake-link.tsx` → Notion `awaiting_onboarding` |
| 11 | `notion-founder-os` | R2 presign → Resend `delivery.tsx` → Notion log |
| 12 | `automation-launch-bundle` | R2 multi-presign (4 keys) → Resend `bundle-delivery.tsx` → Notion log |
| 13 | `agency-operator-bundle` | R2 multi-presign (3 keys) → Resend `bundle-delivery.tsx` → Notion log |
| 14 | `developer-ai-toolkit` | R2 multi-presign (3 keys) → Resend `bundle-delivery.tsx` → Notion log |
| 15 | catch-all | Telegram owner alert → Notion `routing_failed` |

**Normalized payload** (Next.js → Make):

```json
{
  "source": "whop",
  "receivedAt": "2026-05-18T00:00:00.000Z",
  "purchase": {
    "eventId": "evt_xxxxxxxxxx",
    "eventType": "payment.succeeded",
    "membershipId": "mem_xxxxxxxxxx",
    "productId": "prod_xxxxxxxxxx",
    "productSlug": "ai-agent-pack",
    "customerEmail": "buyer@example.com",
    "customerName": "Buyer Name",
    "customerId": "user_xxxxxxxxxx",
    "amount": 4900,
    "currency": "usd",
    "isSubscription": false,
    "intakeToken": null,
    "createdAt": "2026-05-18T00:00:00.000Z"
  }
}
```

Note: `intakeToken` is a UUID string for intake products (`infra-audit`, `automation-spec-doc`, `managed-devops`), `null` for all others.

### Scenario A2: Intake Completion

**Trigger**: Custom webhook from Next.js `/api/intake/submit`
**Make webhook URL env var**: `MAKE_WEBHOOK_URL_SCENARIO_A2`

Payload from Next.js:

```json
{
  "source": "agency-intake",
  "productSlug": "infra-audit",
  "customerEmail": "buyer@example.com",
  "customerName": "Buyer Name",
  "eventId": "evt_xxxxxxxxxx",
  "formData": { ...product-specific fields... }
}
```

Module sequence:
1. Custom webhook: `intake_submitted`
2. Router by `productSlug`:
   - `infra-audit` → IT audit Claude prompt
   - `automation-spec-doc` → Automation spec Claude prompt
   - `managed-devops` → Store onboarding data only (no PDF), update Notion subscriber record
3. Claude API (`claude-sonnet-4-20250514`) → structured JSON (separate `system` parameter)
4. HTTP: Assemble branded HTML from JSON
5. Doppio PDF API → binary
6. HTTP PUT: Upload to R2 (`audits/{eventId}/audit-{timestamp}.pdf` or `specs/{...}`)
7. HTTP: `/api/r2/presign` → 48h URL
8. Resend: Deliver PDF link to customer
9. Notion: Update order → `fulfilled`
10. Telegram: `✅ [product] delivered to {email}`

### Scenario B: Weekly Content Engine

**Schedule**: Every Monday 06:00 UTC

Modules:
1. Scheduler
2. Claude: 5 topic JSON objects (keyword clusters: Claude Code agents, DevOps automation, Make.com tutorials, Next.js SaaS, AI agent workflows)
3. Iterator over 5 topics
4. Claude: 900–1200 word article per topic (markdown)
5. Hashnode API: publish
6. Buffer API: LinkedIn (Tuesday 09:00) + X thread (Wednesday 09:00)
7. Notion: log post URLs
8. Telegram: weekly content summary

### Scenario C: Lead Nurture

**Triggers**: Whop PWYW/free purchase, Shopify email capture

Email sequence:
- Day 0: Welcome + lite agent pack download
- Day 2: "How we assembled 144 AI agents" — proof-of-concept breakdown
- Day 4: Product spotlight by lead source (engineer → Claude Code Pack; founder → Agent Pack; agency → Make Pack)
- Day 7: FAQ + objection handling
- Day 10: 10% coupon + community CTA

### Scenario D: Monthly Subscription Delivery

**Schedule**: 1st of each month, 09:00 UTC
**Make webhook URL env var**: none (scheduled, not webhook-triggered)

Pre-condition: subscriber completed intake form (status `onboarded`). Skip `awaiting_onboarding` with Telegram alert.

Per subscriber:
1. Verify active Whop membership via Whop API
2. Pull UptimeRobot/Better Stack metrics via subscriber-provided API key
3. SSL/DNS checks via HTTP
4. Claude: structured monthly report JSON
5. Doppio PDF
6. R2 upload: `reports/{membershipId}/{YYYY-MM}.pdf`
7. Resend → customer
8. Notion: log `report_delivered`

Boundary: Report-only. No SSH, no server changes.

### Scenario E: Weekly Revenue Report

**Schedule**: Every Sunday 20:00 UTC

Telegram format:
```
Weekly Whop Report — [date]
Revenue: $X gross
Orders: Z
Top product: [slug]
Subscriptions: +A new / -B churned
MRR: $C
Summary: [3 Claude sentences]
```

### Scenario F: Campaign Engine

**Trigger**: POST from Next.js `/api/campaign/trigger`
**Make webhook URL env var**: `MAKE_WEBHOOK_URL_SCENARIO_F`

Input payload:
```json
{
  "campaignName": "string",
  "productSlug": "string",
  "productUrl": "string",
  "launchPrice": 4900,
  "regularPrice": 7900,
  "offerExpiry": "ISO8601",
  "targetAudience": "string",
  "keyBenefit": "string"
}
```

Module sequence:
1. Claude: full campaign copy pack (email subject ×3 A/B, email body, LinkedIn post, X thread ×5, Reddit-style post, product description variant)
2. Canva Connect API: 3 sizes (1:1, 1.91:1, 16:9) from brand template
3. R2 upload: `campaigns/{productSlug}/{timestamp}/`
4. Buffer API: LinkedIn (Tuesday 09:00) + X thread (Wednesday 09:00)
5. Resend/Brevo: email blast to buyer list (A/B variant A)
6. Hashnode: supporting blog post
7. Telegram: campaign summary with asset links + schedule

---

## Technical Architecture

### Stack (Final, v4)

| Layer | Choice |
|---|---|
| Runtime | Bun 1.x |
| Framework | Next.js 15 App Router, TypeScript strict mode |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js v5 (magic link, single `ADMIN_EMAIL`) |
| Storage | Cloudflare R2 via `@aws-sdk/client-s3` |
| Email | Resend SDK + React Email |
| Database | **Prisma on Neon** (idempotency + intake tokens + orders) + Notion API (operational log) |
| AI | Anthropic SDK — `claude-sonnet-4-20250514` |
| PDF | Doppio REST API |
| Validation | Zod throughout |
| Testing | Vitest |
| Deployment | **Vercel** (primary) |

### Prisma Schema (Complete)

Two tables owned by the Next.js app:

```prisma
model WhopProcessedEvent {
  eventId       String   @id
  productSlug   String
  customerEmail String
  processedAt   DateTime @default(now())

  @@index([processedAt])
  @@map("whop_processed_events")
}

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

  @@index([token])
  @@index([expiresAt])
  @@map("whop_intake_tokens")
}
```

### R2 Bucket Structure

```
agency-assets/
├── ai-agent-pack/ai-agent-pack-v1.zip
├── claude-code-agent-pack/claude-code-agent-pack-v1.zip
├── devops-starter-kit/devops-starter-kit-v1.zip
├── make-scenario-pack/make-scenario-pack-v1.zip
├── whop-agency-kit/whop-agency-kit-v1.zip
├── saas-boilerplate/nextjs15-saas-boilerplate-v1.zip
├── notion-founder-os/notion-founder-os-v1.zip
├── audits/{eventId}/audit-{timestamp}.pdf
├── specs/{eventId}/spec-{timestamp}.pdf
├── reports/{membershipId}/{YYYY-MM}.pdf
└── campaigns/{productSlug}/{timestamp}/
    ├── graphic-1x1.png
    ├── graphic-191x1.png
    └── graphic-16x9.png
```

### Full Environment Variables

```bash
# ── Core ─────────────────────────────────────────────────────────────────────
INTERNAL_WEBHOOK_SECRET=         # shared secret between Next.js and Make
INTERNAL_API_KEY=                # for /api/r2/presign internal auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=                    # https://agency.rihan.cloud
ADMIN_EMAIL=                     # single owner email for admin panel

# ── Whop ─────────────────────────────────────────────────────────────────────
WHOP_API_KEY=
WHOP_WEBHOOK_SECRET=
WHOP_CLIENT_ID=

# Whop Product IDs → mapped to slugs in lib/products/product-map.ts
WHOP_PRODUCT_ID_AI_AGENT_PACK=
WHOP_PRODUCT_ID_CLAUDE_CODE_PACK=
WHOP_PRODUCT_ID_DEVOPS_STARTER_KIT=
WHOP_PRODUCT_ID_MAKE_SCENARIO_PACK=
WHOP_PRODUCT_ID_WHOP_AGENCY_KIT=
WHOP_PRODUCT_ID_INFRA_AUDIT=
WHOP_PRODUCT_ID_SAAS_BOILERPLATE=
WHOP_PRODUCT_ID_AUTOMATION_SPEC_DOC=
WHOP_PRODUCT_ID_COMMUNITY=
WHOP_PRODUCT_ID_MANAGED_DEVOPS=
WHOP_PRODUCT_ID_NOTION_FOUNDER_OS=
WHOP_PRODUCT_ID_AUTOMATION_LAUNCH_BUNDLE=
WHOP_PRODUCT_ID_AGENCY_OPERATOR_BUNDLE=
WHOP_PRODUCT_ID_DEVELOPER_AI_TOOLKIT=

# ── Make.com ──────────────────────────────────────────────────────────────────
MAKE_WEBHOOK_URL_SCENARIO_A=     # hook.eu1.make.com/{id} — purchase delivery
MAKE_WEBHOOK_URL_SCENARIO_A2=    # hook.eu1.make.com/{id} — intake completion
MAKE_WEBHOOK_URL_SCENARIO_D=     # hook.eu1.make.com/{id} — subscription activation
MAKE_WEBHOOK_URL_SCENARIO_F=     # hook.eu1.make.com/{id} — campaign engine

# ── Cloudflare R2 ─────────────────────────────────────────────────────────────
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
R2_PUBLIC_DOMAIN=                # e.g. https://assets.rihan.cloud (optional, for public assets)

# ── Email ─────────────────────────────────────────────────────────────────────
RESEND_API_KEY=
BREVO_API_KEY=
FROM_EMAIL=noreply@rihan.cloud
FROM_NAME=Rihan Consulting

# ── AI ────────────────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY=

# ── PDF ───────────────────────────────────────────────────────────────────────
DOPPIO_API_KEY=

# ── Database ──────────────────────────────────────────────────────────────────
NEON_DATABASE_URL=               # postgres://... for Prisma

# ── Notion ────────────────────────────────────────────────────────────────────
NOTION_API_KEY=
NOTION_ORDERS_DB_ID=
NOTION_DEVOPS_SUBS_DB_ID=
NOTION_CONTENT_LOG_DB_ID=

# ── Social / Content ─────────────────────────────────────────────────────────
BUFFER_ACCESS_TOKEN=
HASHNODE_API_KEY=
HASHNODE_PUBLICATION_ID=
CANVA_API_KEY=

# ── Owner ─────────────────────────────────────────────────────────────────────
TELEGRAM_BOT_TOKEN=
TELEGRAM_OWNER_CHAT_ID=

# ── GitHub ────────────────────────────────────────────────────────────────────
GITHUB_PAT=                      # fine-grained PAT (deferred — post-Week 1)
```

---

## Repository Structure (Complete)

```
agency-platform/
├── .github/
│   └── copilot-instructions.md     ← Copilot build spec
├── app/
│   ├── api/
│   │   ├── whop/webhook/route.ts   ← Main entry: verify + idempotency + forward
│   │   ├── r2/presign/route.ts     ← Internal presign (X-Internal-API-Key required)
│   │   ├── intake/
│   │   │   ├── create/route.ts     ← Called internally to generate intake token
│   │   │   └── submit/route.ts     ← Receives intake form, forwards to Make A2
│   │   ├── audit/generate/route.ts ← Direct Claude audit (optional bypass of Make)
│   │   ├── campaign/trigger/route.ts ← Forwards to Make Scenario F
│   │   └── health/route.ts
│   ├── intake/
│   │   └── [token]/page.tsx        ← Branded intake form (replaces Tally)
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx                ← Dashboard: stats + recent orders
│   │   ├── orders/page.tsx
│   │   ├── products/page.tsx
│   │   └── campaign/page.tsx       ← Campaign trigger UI
│   └── layout.tsx
├── lib/
│   ├── whop/
│   │   ├── verify.ts               ← HMAC-SHA256, both header names
│   │   ├── types.ts                ← Zod schemas for Whop events
│   │   └── normalize.ts            ← WhopRawEvent → NormalizedPurchase
│   ├── r2/
│   │   ├── client.ts
│   │   └── presign.ts              ← 48h TTL, hardcoded
│   ├── make/
│   │   └── forward.ts              ← forward(payload, targetUrl) — never throws
│   ├── notion/
│   │   ├── client.ts
│   │   └── orders.ts
│   ├── resend/
│   │   ├── client.ts
│   │   └── templates/              ← React Email components
│   │       ├── delivery.tsx        ← Single-product download
│   │       ├── bundle-delivery.tsx ← Multi-URL bundle download
│   │       ├── intake-link.tsx     ← Intake form invitation
│   │       └── welcome.tsx         ← Community welcome
│   ├── claude/
│   │   ├── client.ts
│   │   ├── audit.ts
│   │   └── spec.ts
│   ├── doppio/pdf.ts
│   ├── intake/
│   │   └── tokens.ts               ← generateToken(), validateToken(), markUsed()
│   ├── idempotency/check.ts        ← Prisma-backed dedup
│   ├── telegram/notify.ts
│   └── products/
│       ├── catalog.ts              ← All 14 slugs with type + r2Key(s)
│       └── product-map.ts          ← WhopProductId env vars → slugs
├── prisma/
│   └── schema.prisma               ← WhopProcessedEvent + WhopIntakeToken
├── types/index.ts
├── emails/
├── tests/
│   ├── webhook.test.ts
│   ├── r2.test.ts
│   ├── idempotency.test.ts
│   ├── intake.test.ts
│   └── routing.test.ts
├── middleware.ts
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Build Sequence

### Week 1 — Days 1–5: ZIP Products Live

| Task | Estimate |
|---|---|
| Curate `agency-agents-full` → `ai-agent-pack-v1.zip` (domain-organized) | 1.5h |
| Create `claude-code-agent-pack-v1.zip` (engineering + testing + specialized + install.sh) | 45min |
| Write `SETUP_GUIDE.pdf` + `CLAUDE_CODE_SETUP.pdf` | 1h |
| Create R2 bucket + upload all ZIPs | 1h |
| Assemble DevOps Kit, Make Pack, Whop Agency Kit ZIPs | 2h |
| Scaffold Next.js app (Phases 1–3 from copilot-instructions.md) | 3h |
| Build admin panel (Phase 4) | 4h |
| Build Make Scenario A (branches 1–5, 11, catch-all) + test | 3h |
| List all ZIP products on Whop (updated titles/descriptions) | 1h |
| Post on X: "144 Claude Code agents you can install in 60 seconds" | 20min |
| Post on LinkedIn | 20min |
| Enable Whop affiliate (30%) | 15min |
| List PWYW lead magnet | 30min |

### Week 2 — Days 6–10: Community + Intake + Nurture

| Task | Estimate |
|---|---|
| Build intake form pages (`/intake/[token]`) for infra-audit + automation-spec-doc | 2h |
| Add intake branches (6, 8) to Scenario A + wire Scenario A2 | 3h |
| Launch $29/month community (Scenario A Branch 9) | 1h |
| Build Scenario B (weekly content engine) | 3h |
| Build Scenario C (lead nurture) | 2h |
| Build Scenario E (weekly revenue report) | 2h |
| Set Canva brand template | 1h |
| Add bundle branches (12–14) to Scenario A | 1h |

### Week 3 — Days 11–15: High-Margin + Campaign Engine

| Task | Estimate |
|---|---|
| Build Scenario F (Campaign Engine) end-to-end | 4h |
| Use Scenario F for first coordinated campaign | 1h |
| Build managed-devops intake + Scenario D when first subscriber onboards | 3h |
| Build internal proposal generator (consulting) | 2h |

---

## Revenue Model

### One-Time Products

| Product | Price | 10 sales/week |
|---|---|---|
| AI Agent Pack Full | $49 | $490/wk |
| Claude Code Agent Pack | $79 | $790/wk |
| DevOps Starter Kit | $59 | $590/wk |
| Make Scenario Pack | $79 | $790/wk |
| Whop Agency Setup Kit | $99 | $990/wk |
| IT Infrastructure Audit | $99 | $990/wk |
| Next.js SaaS Boilerplate | $149 | $1,490/wk |
| Automation Spec Doc | $59 | $590/wk |
| Notion Founder OS | $29 | $290/wk |
| Automation Launch Bundle | $249 | $2,490/wk |
| Developer AI Toolkit | $129 | $1,290/wk |

### Recurring

| Product | Price | @ 20 subscribers |
|---|---|---|
| Community | $29/mo | $580/mo |
| Managed DevOps | $199/mo | $3,980/mo |

---

## Make.com Scenario Creation

Make.com org is **TechSci** (ID: 7648427), team **My Team** (ID: 1695253), zone **eu1.make.com**.

Scenarios can be created directly via MCP. After a scenario is created, you must:
1. Open Make UI → configure connections for each module (Resend, Notion, Telegram, HTTP)
2. Set team variables: `INTERNAL_WEBHOOK_SECRET`, `NOTION_API_KEY`, `RESEND_API_KEY`, etc.
3. Click "Run once" on webhook trigger → send test payload from terminal → confirm field mapping
4. Activate scenario

---

## Reference Links

- [Whop API v5](https://docs.whop.com/api-reference/v5)
- [Whop Webhooks](https://docs.whop.com/developer/guides/webhooks)
- [Make Platform Docs](https://developers.make.com/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Canva Connect API](https://www.canva.com/developers/)
- [Doppio PDF API](https://doppio.sh/docs)
- [Hashnode API](https://apidocs.hashnode.com/)
- [Resend API](https://resend.com/docs/api-reference)
- [agency-agents source](https://github.com/msitarzewski/agency-agents) — MIT license
