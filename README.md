# Autonomous Agency Platform

Zero-human digital product fulfillment platform for Rihan Consulting (TechSci Inc). Includes public marketing site, Whop webhook intake, automated fulfillment, admin ops.

---

## Stack

- **Framework**: Next.js 15 App Router
- **Runtime & Package Manager**: Bun
- **Styling**: Tailwind CSS v4 (CSS-first)
- **Auth**: NextAuth v5 (admin only)
- **DB**: Prisma v6 on Neon (Postgres)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Email**: Resend + React Email
- **AI**: Anthropic SDK (`claude-sonnet-4-20250514`)
- **PDF**: Doppio API
- **Automation**: Make.com (eu1)

---

## Features

- **Marketing site**: `/`, `/products`, `/products/[slug]`, `/pricing`, `/about`, `/legal/*`
- **Whop webhook**: HMAC-verified, idempotent, Make.com routing
- **Intake flow**: single-use tokens + product-specific forms
- **Fulfillment**: Claude JSON → HTML → PDF → R2 + Resend delivery
- **Admin portal**: Notion-backed ops dashboard + campaign trigger
- **SEO**: `robots.txt` + `sitemap.xml`

---

## Operational notes

- **Prisma**: `NEON_DATABASE_URL` must be set for migrations (`.env` or `.env.local`).
- **Whop webhook**: HMAC header normalized (trim + case-insensitive `sha256=`). Validation logs are sanitized (path + code only).
- **Idempotency**: duplicate `event_id` inserts are concurrency-safe.
- **Intake submit**: Make A2 forward retries with bounded backoff before failing.
- **Make forward**: 10s timeout via `AbortController` with proper cleanup.
- **R2 presign**: requires `INTERNAL_API_KEY`; missing env returns 500. Bucket env validated at call time.

---

## Key paths

```text
app/
├── page.tsx                  # Landing
├── products/                 # Catalog + detail pages
├── pricing/                  # Pricing + FAQ
├── about/                    # About
├── legal/                    # Privacy + Terms
├── admin/                    # Admin UI (protected)
├── intake/                   # Intake UI (protected by token)
└── api/                      # Webhook + fulfillment APIs
lib/
├── marketing/products.ts     # Public catalog + pricing helpers
├── whop/                     # Webhook verification + normalization
├── intake/                   # Intake token logic
├── idempotency/              # Whop event dedupe
├── claude/                   # AI audit/spec JSON
├── doppio/                   # HTML templates + PDF
├── r2/                       # Upload + presign
└── resend/                   # Email dispatch
docs/                         # System docs
```

---

## Getting started

```bash
bun install
cp .env.local.example .env.local
bunx prisma generate
bun run dev
```

App runs at `http://localhost:3000`.

---

## Tests

```bash
bun run test
```

Vitest uses `vitest.config.ts` for `@/` alias resolution.

---

## Build

```bash
bun run build
```

---

## Docs

- `docs/architecture.md`
- `docs/whop-integration.md`
- `docs/intake-flow.md`
- `docs/document-fulfillment.md`
- `docs/notifications-emails.md`
- `docs/admin-dashboard.md`
- `docs/testing.md`

---

## Versioning

See `CHANGELOG.md` for release notes.

---

## License

Private repository. All rights reserved by Rihan Consulting & TechSci Inc.
