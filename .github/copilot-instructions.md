# Copilot Instructions — Autonomous Agency Platform
# Rihan Consulting × TechSci Inc
# Last updated: 2026-05-20

## Project Identity

Zero-human digital product fulfillment platform. Next.js 15 + Bun receives Whop purchase webhooks, routes them, and auto-delivers products via Cloudflare R2 + Resend. All automation orchestration in Make.com. This codebase is the webhook receiver, API surface, intake form host, and admin layer only.

**Repo**: new standalone repo, separate from `rihanaws/agency-agents-full`.
**Make.com**: TechSci org (7648427), My Team (1695253), zone eu1.make.com.

---

## Tech Stack — Non-Negotiable

| Layer | Choice |
|---|---|
| Runtime | Bun 1.x (NOT Node.js) |
| Framework | Next.js 15 App Router, TypeScript strict mode |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js v5 (email magic link, owner-only admin) |
| Storage | Cloudflare R2 via `@aws-sdk/client-s3` |
| Email | Resend SDK + React Email |
| Database | **Prisma on Neon** (idempotency + intake tokens) + Notion API (operational log) |
| AI | Anthropic SDK (`@anthropic-ai/sdk`) — model: `claude-sonnet-4-20250514` |
| PDF | Doppio REST API |
| Validation | Zod on every external input |
| Testing | Vitest |
| Deployment | Vercel (Next.js standalone output) |

**Never use**: `npm`, `yarn`, `pnpm`. Use `bun` for all package operations.
**Never use**: `pages/` router. App Router only.
**Never use**: `any` TypeScript type. Strict mode enforced.
**Never use**: Tally or any third-party form service. Intake forms are built into this app.

---

## Repository Structure

```
agency-platform/
├── .github/
│   └── copilot-instructions.md
├── app/
│   ├── api/
│   │   ├── whop/webhook/route.ts       ← Main entry point
│   │   ├── r2/presign/route.ts         ← Internal presign API
│   │   ├── intake/
│   │   │   ├── create/route.ts         ← Token generation (internal)
│   │   │   └── submit/route.ts         ← Form submission → Make A2
│   │   ├── campaign/trigger/route.ts   ← → Make Scenario F
│   │   └── health/route.ts
│   ├── intake/
│   │   └── [token]/page.tsx            ← Branded intake form (replaces Tally)
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── orders/page.tsx
│   │   ├── products/page.tsx
│   │   └── campaign/page.tsx
│   └── layout.tsx
├── lib/
│   ├── whop/
│   │   ├── verify.ts
│   │   ├── types.ts
│   │   └── normalize.ts
│   ├── r2/
│   │   ├── client.ts
│   │   └── presign.ts
│   ├── make/
│   │   └── forward.ts
│   ├── notion/
│   │   ├── client.ts
│   │   └── orders.ts
│   ├── resend/
│   │   ├── client.ts
│   │   └── templates/
│   │       ├── delivery.tsx
│   │       ├── bundle-delivery.tsx
│   │       ├── intake-link.tsx
│   │       └── welcome.tsx
│   ├── claude/
│   │   ├── client.ts
│   │   ├── audit.ts
│   │   └── spec.ts
│   ├── doppio/pdf.ts
│   ├── intake/tokens.ts
│   ├── idempotency/check.ts
│   ├── telegram/notify.ts
│   └── products/
│       ├── catalog.ts
│       └── product-map.ts
├── prisma/schema.prisma
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

## Phase 1: Project Scaffold

```bash
bun create next-app agency-platform --typescript --app --tailwind --eslint
cd agency-platform

bun add \
  @aws-sdk/client-s3 @aws-sdk/s3-request-presigner \
  @anthropic-ai/sdk \
  @notionhq/client \
  @prisma/client \
  resend \
  @react-email/components react-email \
  next-auth@beta \
  zod \
  uuid

bun add -d \
  prisma \
  vitest @vitejs/plugin-react \
  @types/node @types/uuid \
  prettier eslint-config-prettier
```

`next.config.ts`:
```typescript
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@notionhq/client', '@prisma/client'],
}
export default nextConfig
```

`tsconfig.json` paths:
```json
{
  "compilerOptions": {
    "strict": true,
    "paths": { "@/*": ["./*"] }
  }
}
```

---

## Phase 2: Prisma Schema

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("NEON_DATABASE_URL")
}

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

Run: `bunx prisma migrate dev --name init`

---

## Phase 3: Core Infrastructure Libs

### `lib/whop/types.ts`

```typescript
import { z } from 'zod'

export const WhopUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
})

export const WhopProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
})

export const WhopMembershipSchema = z.object({
  id: z.string(),
  user: WhopUserSchema,
  product: WhopProductSchema,
  order_value: z.string(),
  currency: z.string().default('usd'),
  status: z.string(),
  created_at: z.number(),
  renewal_period_end: z.number().nullable().optional(),
})

export const WhopWebhookEventSchema = z.object({
  event_id: z.string(),
  action: z.enum([
    'payment.succeeded',
    'membership.went_valid',
    'membership.went_invalid',
    'membership.went_overdue',
    'payment.refunded',
  ]),
  data: z.object({
    object: WhopMembershipSchema,
  }),
})

export type WhopWebhookEvent = z.infer<typeof WhopWebhookEventSchema>
```

### `lib/whop/verify.ts`

```typescript
import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Whop sends HMAC-SHA256 over the raw body.
 * Header is either 'x-whop-signature' or 'whop-signature' (check both).
 * Format: 'sha256=<hex_digest>' or just the hex digest.
 */
export function verifyWhopSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false

  const receivedHex = signatureHeader.startsWith('sha256=')
    ? signatureHeader.slice(7)
    : signatureHeader

  const expectedHex = createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex')

  try {
    const received = Buffer.from(receivedHex, 'hex')
    const expected = Buffer.from(expectedHex, 'hex')
    if (received.length !== expected.length) return false
    return timingSafeEqual(received, expected)
  } catch {
    return false
  }
}
```

### `lib/whop/normalize.ts`

```typescript
import type { WhopWebhookEvent } from './types'
import { resolveProductSlug } from '@/lib/products/product-map'

export interface NormalizedPurchase {
  eventId: string
  eventType: string
  membershipId: string
  productId: string
  productSlug: string
  customerEmail: string
  customerName: string
  customerId: string
  amount: number        // cents
  currency: string
  isSubscription: boolean
  intakeToken: string | null   // UUID for intake products, null for ZIP/subscription
  createdAt: string
}

export function normalizeWhopEvent(event: WhopWebhookEvent): NormalizedPurchase {
  const membership = event.data.object
  const product = membership.product
  const user = membership.user
  const productSlug = resolveProductSlug(product.id)

  const amountCents = Math.round(parseFloat(membership.order_value || '0') * 100)
  const isSubscription = !!(membership.renewal_period_end)

  return {
    eventId:       event.event_id,
    eventType:     event.action,
    membershipId:  membership.id,
    productId:     product.id,
    productSlug,
    customerEmail: user.email,
    customerName:  user.name ?? user.username,
    customerId:    user.id,
    amount:        amountCents,
    currency:      membership.currency.toLowerCase(),
    isSubscription,
    intakeToken:   null, // Set in route handler after token is generated
    createdAt:     new Date(membership.created_at * 1000).toISOString(),
  }
}
```

### `lib/products/catalog.ts`

```typescript
export const PRODUCT_CATALOG = {
  'ai-agent-pack': {
    name: 'AI Agent Pack — Full Library',
    price: 4900,
    type: 'zip' as const,
    r2Keys: ['ai-agent-pack/ai-agent-pack-v1.zip'],
    emailTemplate: 'delivery' as const,
  },
  'claude-code-agent-pack': {
    name: 'Claude Code Agent Pack',
    price: 7900,
    type: 'zip' as const,
    r2Keys: ['claude-code-agent-pack/claude-code-agent-pack-v1.zip'],
    emailTemplate: 'delivery' as const,
  },
  'devops-starter-kit': {
    name: 'DevOps Starter Kit',
    price: 5900,
    type: 'zip' as const,
    r2Keys: ['devops-starter-kit/devops-starter-kit-v1.zip'],
    emailTemplate: 'delivery' as const,
  },
  'make-scenario-pack': {
    name: 'Make.com Automation Scenario Pack',
    price: 7900,
    type: 'zip' as const,
    r2Keys: ['make-scenario-pack/make-scenario-pack-v1.zip'],
    emailTemplate: 'delivery' as const,
  },
  'whop-agency-kit': {
    name: 'Whop Agency Setup Kit',
    price: 9900,
    type: 'zip' as const,
    r2Keys: ['whop-agency-kit/whop-agency-kit-v1.zip'],
    emailTemplate: 'delivery' as const,
  },
  'infra-audit': {
    name: 'AI Infrastructure Audit',
    price: 9900,
    type: 'intake' as const,
    r2Keys: [],
    emailTemplate: 'intake-link' as const,
  },
  'saas-boilerplate': {
    name: 'Next.js 15 SaaS Boilerplate',
    price: 14900,
    type: 'zip' as const,
    r2Keys: ['saas-boilerplate/nextjs15-saas-boilerplate-v1.zip'],
    emailTemplate: 'delivery' as const,
  },
  'automation-spec-doc': {
    name: 'Automation Spec Doc',
    price: 5900,
    type: 'intake' as const,
    r2Keys: [],
    emailTemplate: 'intake-link' as const,
  },
  'community': {
    name: 'Autonomous Founder Systems Community',
    price: 2900,
    type: 'subscription' as const,
    r2Keys: [],
    emailTemplate: 'welcome' as const,
  },
  'managed-devops': {
    name: 'Managed DevOps Monthly Report',
    price: 19900,
    type: 'subscription-intake' as const,
    r2Keys: [],
    emailTemplate: 'intake-link' as const,
  },
  'notion-founder-os': {
    name: 'Notion Founder OS Template',
    price: 2900,
    type: 'zip' as const,
    r2Keys: ['notion-founder-os/notion-founder-os-v1.zip'],
    emailTemplate: 'delivery' as const,
  },
  'automation-launch-bundle': {
    name: 'Automation Launch Bundle',
    price: 24900,
    type: 'bundle' as const,
    r2Keys: [
      'saas-boilerplate/nextjs15-saas-boilerplate-v1.zip',
      'ai-agent-pack/ai-agent-pack-v1.zip',
      'make-scenario-pack/make-scenario-pack-v1.zip',
      'devops-starter-kit/devops-starter-kit-v1.zip',
    ],
    emailTemplate: 'bundle-delivery' as const,
  },
  'agency-operator-bundle': {
    name: 'Agency Operator Bundle',
    price: 14900,
    type: 'bundle' as const,
    r2Keys: [
      'whop-agency-kit/whop-agency-kit-v1.zip',
      'make-scenario-pack/make-scenario-pack-v1.zip',
      'ai-agent-pack/ai-agent-pack-v1.zip',
    ],
    emailTemplate: 'bundle-delivery' as const,
  },
  'developer-ai-toolkit': {
    name: 'Developer AI Toolkit',
    price: 12900,
    type: 'bundle' as const,
    r2Keys: [
      'claude-code-agent-pack/claude-code-agent-pack-v1.zip',
      'devops-starter-kit/devops-starter-kit-v1.zip',
      'saas-boilerplate/nextjs15-saas-boilerplate-v1.zip',
    ],
    emailTemplate: 'bundle-delivery' as const,
  },
} as const

export type ProductSlug = keyof typeof PRODUCT_CATALOG
export type ProductType = (typeof PRODUCT_CATALOG)[ProductSlug]['type']

export const INTAKE_SLUGS = new Set<ProductSlug>(['infra-audit', 'automation-spec-doc', 'managed-devops'])
export const SUBSCRIPTION_SLUGS = new Set<ProductSlug>(['community', 'managed-devops'])
```

### `lib/products/product-map.ts`

```typescript
import type { ProductSlug } from './catalog'

function envId(key: string): string {
  const val = process.env[key]
  if (!val) console.warn(`[product-map] Missing env var: ${key}`)
  return val ?? `__missing_${key}__`
}

function buildMap(): Record<string, ProductSlug> {
  return {
    [envId('WHOP_PRODUCT_ID_AI_AGENT_PACK')]:             'ai-agent-pack',
    [envId('WHOP_PRODUCT_ID_CLAUDE_CODE_PACK')]:          'claude-code-agent-pack',
    [envId('WHOP_PRODUCT_ID_DEVOPS_STARTER_KIT')]:        'devops-starter-kit',
    [envId('WHOP_PRODUCT_ID_MAKE_SCENARIO_PACK')]:        'make-scenario-pack',
    [envId('WHOP_PRODUCT_ID_WHOP_AGENCY_KIT')]:           'whop-agency-kit',
    [envId('WHOP_PRODUCT_ID_INFRA_AUDIT')]:               'infra-audit',
    [envId('WHOP_PRODUCT_ID_SAAS_BOILERPLATE')]:          'saas-boilerplate',
    [envId('WHOP_PRODUCT_ID_AUTOMATION_SPEC_DOC')]:       'automation-spec-doc',
    [envId('WHOP_PRODUCT_ID_COMMUNITY')]:                 'community',
    [envId('WHOP_PRODUCT_ID_MANAGED_DEVOPS')]:            'managed-devops',
    [envId('WHOP_PRODUCT_ID_NOTION_FOUNDER_OS')]:         'notion-founder-os',
    [envId('WHOP_PRODUCT_ID_AUTOMATION_LAUNCH_BUNDLE')]:  'automation-launch-bundle',
    [envId('WHOP_PRODUCT_ID_AGENCY_OPERATOR_BUNDLE')]:    'agency-operator-bundle',
    [envId('WHOP_PRODUCT_ID_DEVELOPER_AI_TOOLKIT')]:      'developer-ai-toolkit',
  }
}

export function resolveProductSlug(whopProductId: string): ProductSlug {
  return (buildMap()[whopProductId] ?? 'unknown') as ProductSlug
}
```

### `lib/idempotency/check.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function isEventProcessed(eventId: string): Promise<boolean> {
  const existing = await prisma.whopProcessedEvent.findUnique({
    where: { eventId },
    select: { eventId: true },
  })
  return existing !== null
}

export async function markEventProcessed(
  eventId: string,
  productSlug: string,
  customerEmail: string,
): Promise<void> {
  await prisma.whopProcessedEvent.create({
    data: { eventId, productSlug, customerEmail },
  })
}
```

### `lib/intake/tokens.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

const TOKEN_TTL_DAYS = 7

export async function generateIntakeToken(params: {
  eventId: string
  productSlug: string
  customerEmail: string
  customerName: string
}): Promise<string> {
  const token = randomUUID()
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)

  await prisma.whopIntakeToken.create({
    data: { token, expiresAt, ...params },
  })

  return token
}

export async function validateIntakeToken(token: string): Promise<{
  valid: boolean
  record?: {
    eventId: string
    productSlug: string
    customerEmail: string
    customerName: string
    usedAt: Date | null
    expiresAt: Date
  }
}> {
  const record = await prisma.whopIntakeToken.findUnique({ where: { token } })
  if (!record) return { valid: false }
  if (record.usedAt) return { valid: false, record }  // already used
  if (record.expiresAt < new Date()) return { valid: false, record }  // expired
  return { valid: true, record }
}

export async function markTokenUsed(token: string): Promise<void> {
  await prisma.whopIntakeToken.update({
    where: { token },
    data: { usedAt: new Date() },
  })
}
```

### `lib/make/forward.ts`

```typescript
/**
 * forward(payload, targetUrl) — never throws.
 * Make failures are owner-notified but must not fail the Whop webhook response.
 * The route handler resolves the correct Make URL before calling this.
 */
export async function forwardToMake(
  payload: unknown,
  targetUrl: string,
): Promise<boolean> {
  const internalSecret = process.env.INTERNAL_WEBHOOK_SECRET
  if (!internalSecret) {
    console.error('[make/forward] INTERNAL_WEBHOOK_SECRET not set')
    return false
  }

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Webhook-Secret': internalSecret,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      console.error(`[make/forward] HTTP ${res.status}`, { targetUrl })
      return false
    }

    return true
  } catch (err) {
    console.error('[make/forward] fetch threw', { error: (err as Error).message, targetUrl })
    return false
  }
}
```

### `lib/r2/presign.ts`

```typescript
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

const TTL_SECONDS = 48 * 60 * 60 // 48h — never change this

export async function generatePresignedUrl(r2Key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: r2Key,
  })
  return getSignedUrl(r2, command, { expiresIn: TTL_SECONDS })
}

export async function generatePresignedUrls(r2Keys: string[]): Promise<string[]> {
  return Promise.all(r2Keys.map(generatePresignedUrl))
}
```

### `lib/telegram/notify.ts`

```typescript
export async function notifyOwner(message: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_OWNER_CHAT_ID
  if (!botToken || !chatId) return

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    })
  } catch {
    // Never throw — Telegram is non-critical
  }
}
```

### `lib/claude/audit.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const MODEL = 'claude-sonnet-4-20250514'

export interface AuditOutput {
  executiveSummary: string
  riskScore: number  // 0–100
  sections: Array<{
    title: string
    findings: string[]
    severity: 'low' | 'medium' | 'high' | 'critical'
    recommendations: string[]
  }>
  roadmap: Array<{
    priority: 'P0' | 'P1' | 'P2'
    action: string
    estimatedEffort: string
  }>
}

const AUDIT_SYSTEM_PROMPT = `You are a senior infrastructure security auditor.
Return ONLY valid JSON matching this exact structure — no markdown, no prose, no code fences:
{
  "executiveSummary": "string (2-3 sentences)",
  "riskScore": number (0-100),
  "sections": [{"title":"string","findings":["string"],"severity":"low|medium|high|critical","recommendations":["string"]}],
  "roadmap": [{"priority":"P0|P1|P2","action":"string","estimatedEffort":"string"}]
}`

export async function generateAuditReport(formData: Record<string, unknown>): Promise<AuditOutput> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: AUDIT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze this infrastructure and return the audit JSON:\n\n${JSON.stringify(formData, null, 2)}`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    return JSON.parse(raw) as AuditOutput
  } catch {
    // Strip accidental markdown fences if Claude added them
    const stripped = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(stripped) as AuditOutput
  }
}
```

### `lib/claude/spec.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const MODEL = 'claude-sonnet-4-20250514'

export interface SpecOutput {
  processName: string
  scenarioTitle: string
  triggerType: 'webhook' | 'schedule' | 'manual'
  modules: Array<{
    order: number
    app: string
    action: string
    inputs: string[]
    outputs: string[]
  }>
  apiRequirements: string[]
  buildEstimate: string
  caveats: string[]
}

const SPEC_SYSTEM_PROMPT = `You are a Make.com automation architect.
Return ONLY valid JSON matching this exact structure — no markdown, no prose:
{
  "processName": "string",
  "scenarioTitle": "string",
  "triggerType": "webhook|schedule|manual",
  "modules": [{"order":1,"app":"string","action":"string","inputs":["string"],"outputs":["string"]}],
  "apiRequirements": ["string"],
  "buildEstimate": "string",
  "caveats": ["string"]
}`

export async function generateAutomationSpec(formData: Record<string, unknown>): Promise<SpecOutput> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SPEC_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate a Make.com automation specification for this process:\n\n${JSON.stringify(formData, null, 2)}`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  try {
    return JSON.parse(raw) as SpecOutput
  } catch {
    const stripped = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(stripped) as SpecOutput
  }
}
```

### `lib/doppio/pdf.ts`

```typescript
export async function htmlToPdf(html: string): Promise<Buffer> {
  const res = await fetch('https://api.doppio.sh/v1/pdf/sync', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.DOPPIO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page: {
        setContent: { html, waitUntil: 'networkidle0' },
        pdf: {
          format: 'A4',
          printBackground: true,
          margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
        },
      },
    }),
  })

  if (!res.ok) throw new Error(`Doppio error: ${res.status} ${await res.text()}`)
  return Buffer.from(await res.arrayBuffer())
}
```

---

## Phase 4: Webhook Route (Critical — Follow Exactly)

`app/api/whop/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyWhopSignature } from '@/lib/whop/verify'
import { WhopWebhookEventSchema } from '@/lib/whop/types'
import { normalizeWhopEvent } from '@/lib/whop/normalize'
import { isEventProcessed, markEventProcessed } from '@/lib/idempotency/check'
import { forwardToMake } from '@/lib/make/forward'
import { notifyOwner } from '@/lib/telegram/notify'
import { generateIntakeToken } from '@/lib/intake/tokens'
import { INTAKE_SLUGS, SUBSCRIPTION_SLUGS } from '@/lib/products/catalog'

const HANDLED_EVENTS = new Set(['payment.succeeded', 'membership.went_valid'])

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Read raw body FIRST — signature is over raw bytes
  const rawBody = await req.text()

  // 2. Verify Whop signature — check both possible header names
  const signatureHeader =
    req.headers.get('x-whop-signature') ??
    req.headers.get('whop-signature')

  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[whop-webhook] WHOP_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'misconfigured' }, { status: 500 })
  }

  if (!verifyWhopSignature(rawBody, signatureHeader, webhookSecret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // 3. Parse + Zod validate
  let parsed: ReturnType<typeof WhopWebhookEventSchema.safeParse>
  try {
    parsed = WhopWebhookEventSchema.safeParse(JSON.parse(rawBody))
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
  }

  const event = parsed.data

  // 4. Filter unhandled event types
  if (!HANDLED_EVENTS.has(event.action)) {
    return NextResponse.json({ received: true, skipped: true })
  }

  // 5. Idempotency check — runs before Make ever sees this event
  const alreadyProcessed = await isEventProcessed(event.event_id)
  if (alreadyProcessed) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  // 6. Normalize
  const purchase = normalizeWhopEvent(event)

  // 7. Generate intake token for intake products
  if (INTAKE_SLUGS.has(purchase.productSlug as never)) {
    const token = await generateIntakeToken({
      eventId: purchase.eventId,
      productSlug: purchase.productSlug,
      customerEmail: purchase.customerEmail,
      customerName: purchase.customerName,
    })
    purchase.intakeToken = token
  }

  // 8. Resolve Make webhook URL
  const makeUrl = resolveMakeUrl(purchase.productSlug, purchase.isSubscription)
  if (!makeUrl) {
    console.error('[whop-webhook] No Make URL for slug', purchase.productSlug)
    await notifyOwner(`⚠️ No Make URL configured for: ${purchase.productSlug}`)
    return NextResponse.json({ received: true, warning: 'no_route' })
  }

  // 9. Forward to Make — mark processed only on success so Whop can retry
  const forwardPayload = {
    source: 'whop',
    receivedAt: new Date().toISOString(),
    purchase,
  }

  const forwarded = await forwardToMake(forwardPayload, makeUrl)

  if (!forwarded) {
    await notifyOwner(`⚠️ Make forward failed for event ${purchase.eventId} (${purchase.productSlug})`)
    // Return 500 so Whop retries
    return NextResponse.json({ error: 'upstream_failed' }, { status: 500 })
  }

  // 10. Mark processed only after successful forward
  await markEventProcessed(purchase.eventId, purchase.productSlug, purchase.customerEmail)

  return NextResponse.json({ received: true })
}

function resolveMakeUrl(slug: string, isSubscription: boolean): string | null {
  // Subscription activation → Scenario D
  if (isSubscription && SUBSCRIPTION_SLUGS.has(slug as never)) {
    return process.env.MAKE_WEBHOOK_URL_SCENARIO_D ?? null
  }
  // All one-time purchases (including intake) → Scenario A
  return process.env.MAKE_WEBHOOK_URL_SCENARIO_A ?? null
}

export function GET(): NextResponse {
  return NextResponse.json({ error: 'method not allowed' }, { status: 405 })
}
```

---

## Phase 5: Intake Routes

### `app/api/intake/submit/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateIntakeToken, markTokenUsed } from '@/lib/intake/tokens'
import { forwardToMake } from '@/lib/make/forward'
import { notifyOwner } from '@/lib/telegram/notify'

const SubmitSchema = z.object({
  token: z.string().uuid(),
  formData: z.record(z.unknown()),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json()
  const parsed = SubmitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input' }, { status: 400 })
  }

  const { token, formData } = parsed.data

  const { valid, record } = await validateIntakeToken(token)
  if (!valid || !record) {
    return NextResponse.json({ error: 'invalid or expired token' }, { status: 403 })
  }

  const makeUrl = process.env.MAKE_WEBHOOK_URL_SCENARIO_A2
  if (!makeUrl) {
    return NextResponse.json({ error: 'misconfigured' }, { status: 500 })
  }

  const payload = {
    source: 'agency-intake',
    productSlug: record.productSlug,
    eventId: record.eventId,
    customerEmail: record.customerEmail,
    customerName: record.customerName,
    formData,
  }

  const forwarded = await forwardToMake(payload, makeUrl)
  if (!forwarded) {
    await notifyOwner(`⚠️ Make A2 forward failed for intake token ${token}`)
    return NextResponse.json({ error: 'upstream_failed' }, { status: 500 })
  }

  await markTokenUsed(token)

  return NextResponse.json({ success: true })
}
```

### `app/intake/[token]/page.tsx`

Server component. Validates token, renders the correct form based on `productSlug`. Fields:
- `infra-audit`: server type, cloud provider, OS, services, Cloudflare use, SSL, monitoring, primary concern, notes
- `automation-spec-doc`: process name, manual steps, tools, trigger type, volume, output type, notes
- `managed-devops`: endpoints, UptimeRobot key, Better Stack key, alert email, domains, notes

On submit: POST to `/api/intake/submit` with `{ token, formData }`.

Design: dark bg `#171614`, teal `#4f98a3`, Tailwind v4. Branded header with Rihan Consulting logo text. Show product name, customer name, expiry date. Show "Token already used" or "Token expired" states clearly.

---

## Phase 6: R2 Presign API

`app/api/r2/presign/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generatePresignedUrl, generatePresignedUrls } from '@/lib/r2/presign'

const BodySchema = z.object({
  r2Key: z.string().optional(),
  r2Keys: z.array(z.string()).optional(),
}).refine(d => d.r2Key || d.r2Keys, { message: 'r2Key or r2Keys required' })

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Internal-only: require API key
  if (req.headers.get('x-internal-api-key') !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const parsed = BodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input' }, { status: 400 })
  }

  const { r2Key, r2Keys } = parsed.data

  if (r2Keys) {
    const urls = await generatePresignedUrls(r2Keys)
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    return NextResponse.json({ urls, expiresAt })
  }

  const url = await generatePresignedUrl(r2Key!)
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  return NextResponse.json({ url, expiresAt })
}
```

---

## Phase 7: Campaign Trigger API

`app/api/campaign/trigger/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { forwardToMake } from '@/lib/make/forward'

const CampaignSchema = z.object({
  campaignName: z.string().min(1),
  productSlug: z.string().min(1),
  productUrl: z.string().url(),
  launchPrice: z.number().int().positive(),
  regularPrice: z.number().int().positive(),
  offerExpiry: z.string().datetime(),
  targetAudience: z.string().min(1),
  keyBenefit: z.string().min(1),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (req.headers.get('x-internal-api-key') !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const parsed = CampaignSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const makeUrl = process.env.MAKE_WEBHOOK_URL_SCENARIO_F
  if (!makeUrl) {
    return NextResponse.json({ error: 'MAKE_WEBHOOK_URL_SCENARIO_F not set' }, { status: 500 })
  }

  const forwarded = await forwardToMake(parsed.data, makeUrl)
  return NextResponse.json({ success: forwarded })
}
```

---

## Phase 8: Admin Panel

Protected by NextAuth.js magic link (ADMIN_EMAIL env var). Middleware at `middleware.ts` guards `/admin/*`.

**Design**: bg `#171614`, surface `#1c1b19`, primary `#4f98a3`, Tailwind v4, dark mode only, responsive ≥375px.

Pages:

- `/admin` — Stats cards: Total Revenue, Orders Today, Active Subscriptions, MRR. Recent 20 orders table.
- `/admin/orders` — Paginated Notion order log. Status badges: `fulfilled` (green), `awaiting_intake` (yellow), `awaiting_onboarding` (yellow), `routing_failed` (red). "Resend Delivery" action (POST to internal endpoint).
- `/admin/products` — PRODUCT_CATALOG table with asset status (check R2 key exists). Shows r2Keys for each product.
- `/admin/campaign` — Campaign trigger form. All `CampaignSchema` fields. Dropdown for productSlug (from PRODUCT_CATALOG keys). POST to `/api/campaign/trigger`.

---

## Phase 9: Email Templates

All templates use React Email. Located in `emails/` and `lib/resend/templates/`.

**`delivery.tsx`** — Single-product ZIP download:
Props: `{ productName, customerName, downloadUrl, expiresAt: string }`
Link expires in 48 hours. Bold warning about expiry. Reply-to: hello@rihan.cloud.

**`bundle-delivery.tsx`** — Bundle multi-file:
Props: `{ bundleName, customerName, downloads: Array<{ label: string, url: string }>, expiresAt: string }`
Renders a labelled list of download buttons.

**`intake-link.tsx`** — Intake form invitation:
Props: `{ productName, customerName, intakeUrl, expiresAt: string }`
`intakeUrl` = `https://agency.rihan.cloud/intake/{token}`
Link expires in 7 days (token TTL). Include what to expect after submission.

**`welcome.tsx`** — Community welcome:
Props: `{ customerName, communityUrl }`

---

## Phase 10: Tests

```typescript
// tests/webhook.test.ts
describe('Whop webhook', () => {
  it('rejects missing/invalid signature with 401')
  it('returns 200 with duplicate:true on repeated event_id')
  it('skips unhandled event types with skipped:true')
  it('generates intake token for infra-audit purchases')
  it('forwards normalized payload to correct Make URL')
  it('returns 500 if Make forward fails (so Whop retries)')
  it('does not mark processed if Make forward fails')
  it('marks processed after successful Make forward')
})

describe('Intake tokens', () => {
  it('generateIntakeToken creates a record with 7-day expiry')
  it('validateIntakeToken returns valid:true for fresh token')
  it('validateIntakeToken returns valid:false for used token')
  it('validateIntakeToken returns valid:false for expired token')
  it('markTokenUsed sets usedAt')
})

describe('R2 presign', () => {
  it('generates URL with X-Amz-Expires=172800')
  it('rejects requests without X-Internal-API-Key with 401')
  it('accepts r2Keys array and returns urls array')
})

describe('Product routing', () => {
  it('all 14 slugs in PRODUCT_CATALOG have defined type')
  it('zip/bundle products have non-empty r2Keys')
  it('intake/subscription products have empty r2Keys')
  it('INTAKE_SLUGS contains exactly: infra-audit, automation-spec-doc, managed-devops')
})
```

---

## Environment Variables (Complete `.env.local.example`)

```bash
# Core
INTERNAL_WEBHOOK_SECRET=
INTERNAL_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
ADMIN_EMAIL=

# Whop
WHOP_API_KEY=
WHOP_WEBHOOK_SECRET=
WHOP_CLIENT_ID=

# Whop Product IDs
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

# Make.com (eu1.make.com)
MAKE_WEBHOOK_URL_SCENARIO_A=
MAKE_WEBHOOK_URL_SCENARIO_A2=
MAKE_WEBHOOK_URL_SCENARIO_D=
MAKE_WEBHOOK_URL_SCENARIO_F=

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
R2_PUBLIC_DOMAIN=

# Email
RESEND_API_KEY=
BREVO_API_KEY=
FROM_EMAIL=noreply@rihan.cloud
FROM_NAME=Rihan Consulting

# AI
ANTHROPIC_API_KEY=

# PDF
DOPPIO_API_KEY=

# Database
NEON_DATABASE_URL=

# Notion
NOTION_API_KEY=
NOTION_ORDERS_DB_ID=
NOTION_DEVOPS_SUBS_DB_ID=
NOTION_CONTENT_LOG_DB_ID=

# Social
BUFFER_ACCESS_TOKEN=
HASHNODE_API_KEY=
HASHNODE_PUBLICATION_ID=
CANVA_API_KEY=

# Owner
TELEGRAM_BOT_TOKEN=
TELEGRAM_OWNER_CHAT_ID=

# GitHub (deferred — post-Week 1)
GITHUB_PAT=
```

---

## Code Quality Rules

1. **Zod on every external input** — webhooks, API body, query params, intake forms
2. **No `any` types** — use `unknown`, narrow with Zod
3. **Try/catch on every route handler** — return structured JSON errors
4. **Never log secrets** — no `console.log(process.env.*)`
5. **Never block the Whop webhook** — Make/Notion/Telegram failures caught, logged, not propagated
6. **Idempotency enforced in Next.js** — Make never sees the same event twice
7. **React Email for all templates** — no HTML string concatenation
8. **Server Components by default** — `"use client"` only for interactive elements
9. **Intake tokens single-use** — mark used immediately after successful Make forward
10. **Mark processed after forward** — not before, so Whop can retry on Make downtime

---

## Deployment

- **Platform**: Vercel
- **Build**: `bun run build`
- **Output mode**: `standalone`
- **Webhook URL registered in Whop**: `https://agency.rihan.cloud/api/whop/webhook`
- **Make webhook URLs**: set in Vercel env vars after creating scenarios in Make UI
- **Prisma**: run `bunx prisma migrate deploy` in Vercel build command or before first deploy
