# Testing & Verification

Vitest for unit tests. Next.js build for type + render checks.

---

## Run tests

```bash
bun run test
```

Notes:

- `vitest.config.ts` maps `@/` → repo root
- Prisma is mocked in tests; no DB required

---

## Lint

```bash
bun run lint
```

---

## Build

```bash
bunx prisma generate
bun run build
```
