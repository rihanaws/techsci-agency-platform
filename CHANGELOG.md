# Changelog

All notable changes to this project will be documented here.

## 2026-05-29

### Fixed
- Concurrency-safe idempotency marking for Whop events.
- Intake token create now throws a domain error on DB failure.
- R2 presign validates bucket env and returns clearer misconfig errors.
- Make forward timeout uses AbortController with cleanup.
- Whop signature parsing normalizes header input.
- Webhook validation logs sanitized (no raw payload detail).
- Intake Make A2 forward retries with bounded backoff.
- Presign API returns 500 when internal API key is missing.
- Notion intake logging moved off critical webhook path with failure notification.

## 2026-05-28

### Added
- Public marketing site pages (`/`, `/products`, `/products/[slug]`, `/pricing`, `/about`, `/legal/*`)
- Static product catalog and detail copy in `lib/marketing/products.ts`
- `robots.txt` and `sitemap.xml` routes
- Framer Motion stat strip and Lucide icons for marketing UI
- Vitest alias config (`vitest.config.ts`)

### Fixed
- Vitest `@/` alias resolution
- Prisma test mocks for `PrismaClient` constructor
