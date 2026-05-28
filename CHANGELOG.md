# Changelog

All notable changes to this project will be documented here.

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
