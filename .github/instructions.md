# GitHub Engineering & Delivery Workflows

This document outlines the branching strategies, commit guidelines, PR requirements, and GitHub Actions environments used to develop the TechSci Agency Platform.

---

## 🌿 Branching Model

We follow a structured trunk-based/feature-branch flow to maintain a stable, production-ready `main` branch:

1. **`main` Branch**: Contains the deployable production release history. Direct pushes are restricted; changes should enter via Pull Requests (PRs).
2. **Feature Branches (`feature/*` or `feat/*`)**: Created for new components, integrations, or layouts.
3. **Hotfix Branches (`hotfix/*`)**: Created for immediate bug fixes in production.

---

## 💬 Commit Conventions

Commits must follow the **Conventional Commits** standard to automate changelogs and trace system evolutions:

```text
<type>(<scope>): <short description>
```

### Types
- `feat`: A new user-facing feature (e.g., `feat(api): add stripe billing`).
- `fix`: A code bug fix (e.g., `fix(whop): timing safe check exception`).
- `docs`: Documentation edits (e.g., `docs: update API mapping specs`).
- `style`: Changes that do not affect code logic (e.g., formatting, semicolons).
- `refactor`: Structural rewrite of existing logic with no behavioral changes.
- `test`: Adding or correcting tests (e.g., `test: add R2 client mocks`).
- `chore`: Maintenance work (e.g., updating dependencies, CI actions).

---

## 🔀 Pull Request Guidelines

1. **Title**: Follow Conventional Commits format (e.g., `feat(ui): implement paginated admin order rows`).
2. **PR Description**: Include:
   - Summary of the changes.
   - Associated ticket/milestone checklist links.
   - Details of manual tests completed.
3. **Reviewers**: Every PR requires at least **1 approved review** from a repository administrator before merging.
4. **CI Checks**: The Continuous Integration suite must pass completely (green checkmark) before a merge is permitted.

---

## 🤖 GitHub Actions CI/CD Settings

We configure two automated workflows inside `.github/workflows/`:

### 1. Continuous Integration (`ci.yml`)
Runs on every push to `main` and on pull requests targeting `main`.
- **Environment**: Ubuntu Linux using **Bun**.
- **Steps**:
  - Installs Bun and caches package dependencies.
  - Generates the database Prisma Client.
  - Verifies code quality (`bun run lint`).
  - Runs the unit test suite (`bun run test`).
  - Builds the Next.js production build (`bun run build`).

### 2. Code Review & Quality (`codereview.yml`)
Runs on all pull requests targeting `main`.
- **Environment**: Ubuntu Linux.
- **Steps**:
  - Checks formatting constraints using Prettier.
  - Scans for dependency vulnerabilities via `bun pm audit`.

### 🔐 Action Secrets Configuration
To enable database client generation and application build testing in GitHub Actions, you must add the following variables under **Settings > Secrets and variables > Actions**:

| Secret Name | Purpose | Example |
| :--- | :--- | :--- |
| `NEON_DATABASE_URL` | Neon PG connection URL (used to generate schema) | `postgresql://user:pass@neon/db` |
| `NEXTAUTH_SECRET` | Secret key used to encrypt Auth cookies | `random-sha256-string` |
| `INTERNAL_API_KEY` | Key for authenticating backend route syncs | `secure-internal-token` |
| `NOTION_API_KEY` | Notion Integration Token | `secret_notion_key` |
| `NOTION_ORDERS_DB_ID` | Notion Database UUID | `32-char-database-id` |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 Client Write Keys | `s3-access-key-id` |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY`| R2 Client Secrets | `s3-secret-access-key` |
| `CLOUDFLARE_R2_BUCKET_NAME` | R2 Bucket Name | `techsci-agency-fulfillment` |
```
