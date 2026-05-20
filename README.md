# TechSci Agency Platform

An autonomous, zero-human digital product fulfillment platform built for Rihan Consulting in partnership with TechSci Inc. It processes purchase events, issues intake forms, generates AI-driven PDFs, uploads deliverables to Cloudflare R2, logs transactions in Notion, and dispatches customer notifications automatically.

---

## 🚀 Technology Stack

- **Framework**: Next.js 15 (App Router, Strict TypeScript)
- **Runtime & Package Manager**: Bun 1.x
- **Styling**: Tailwind CSS v4
- **Database / ORM**: Prisma ORM v6 on Neon (PostgreSQL)
- **Authentication**: NextAuth v5 (Beta, Resend Magic Link)
- **Storage**: Cloudflare R2 (S3-compatible API)
- **Email Delivery**: Resend & React Email
- **PDF Generation**: Doppio PDF API (Chromium-based Sync PDF engine)
- **Artificial Intelligence**: Anthropic SDK (`claude-sonnet-4-20250514`)
- **Integration Layer**: Make.com Webhooks (eu1.make.com)

---

## ✨ Features

- **Robust Webhook Processor (`/api/whop/webhook`)**:
  - Secure HMAC-SHA256 signature verification.
  - Multi-level idempotency checking via Prisma to guarantee exactly-once processing.
  - Automatic routing logic: instant ZIP delivery vs. multi-day secure intake forms.
- **Intake Flow Engine**:
  - Dynamic UUID token generation with 7-day TTL.
  - Tailored frontend questionnaire layouts matching specific product specs (`infra-audit`, `automation-spec-doc`, `managed-devops`).
  - Strict token expiration and single-use validation.
- **Auto-Fulfillment Pipeline (`/api/fulfillment`)**:
  - Structured data analysis utilizing Claude Sonnet.
  - High-fidelity PDF rendering via Doppio using custom inline templates.
  - Presigned 48-hour download link generation for secure asset delivery.
- **Operational Admin Dashboard (`/admin`)**:
  - Magic-link passwordless login restricted to the system administrator.
  - Live summaries (sales, pending intake forms, active subs) queried directly from Notion.
  - Paginated orders directory with inline status updates using Next.js Server Actions.
  - Trigger portal for launching outbound email campaigns via Make.com.

---

## 📁 Repository Structure

```text
├── __tests__/            # Vitest unit test suites
├── app/
│   ├── admin/            # Admin Panel UI & actions (Dashboard, Orders, Campaigns)
│   ├── api/              # API Endpoints (whop webhooks, fulfillment, presign, intake)
│   ├── intake/           # Customer intake questionnaire interface
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── claude/           # Anthropic API clients and prompt wrappers
│   ├── doppio/           # Doppio PDF client and HTML print templates
│   ├── idempotency/      # Duplicate purchase event filters
│   ├── intake/           # Secure intake token managers
│   ├── make/             # Webhook forwarders to Make.com
│   ├── notion/           # Notion DB adapters (orders log & status updates)
│   ├── r2/               # Cloudflare R2 storage clients and URL presigners
│   └── resend/           # Resend email clients and dispatcher templates
├── prisma/               # Prisma Database Schemas
├── types/                # Strict Type/Interface definitions
└── next.config.ts        # Next.js standalone configurations
```

---

## 🛠️ Getting Started

### 1. Prerequisites
Ensure you have [Bun](https://bun.sh/) installed:
```bash
bun --version
```

### 2. Environment Setup
Copy the example environment file and fill in the required API keys and connection credentials:
```bash
cp .env.local.example .env.local
```

### 3. Installation & Database Generation
Install dependencies and generate the Prisma Client matching the schema definition:
```bash
bun install
bunx prisma generate
```

### 4. Running the Application

Start the local development server:
```bash
bun run dev
```
The site will be available at `http://localhost:3000`.

### 5. Running Tests
Execute the Vitest suite to verify webhook signature validation and normalization parsers:
```bash
bun run test
```

### 6. Production Builds
Compile the project to a production-ready standalone output bundle:
```bash
bun run build
```
This configuration outputs a minimized standalone server optimized for Docker or cloud hosting.

---

## 🛡️ License
Private repository. All rights reserved by Rihan Consulting & TechSci Inc.
