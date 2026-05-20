# Customer Intake Flow

This document details the lifecycle of customer intake tokens, validation logic, and the user interface for product questionnaires.

---

## 🔑 Intake Token Lifecycle

For high-ticket automated digital products (such as security assessments or software specifications), the platform requires inputs from the customer. 

The intake process is governed by secure, single-use UUID tokens managed in [lib/intake/tokens.ts](file:///Users/rihan/all-coding-project/techsci-agency-platform/lib/intake/tokens.ts).

### 1. Database Model (`prisma/schema.prisma`)
Intake tokens are stored in the database with their associated purchase metadata and a strict expiration date:
```prisma
model WhopIntakeToken {
  token         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  eventId       String   @unique @map("event_id")
  productSlug   String   @map("product_slug")
  customerEmail String   @map("customer_email")
  customerName  String   @map("customer_name")
  isUsed        Boolean  @default(false) @map("is_used")
  expiresAt     DateTime @map("expires_at")
  createdAt     DateTime @default(now()) @map("created_at")

  @@map("whop_intake_tokens")
}
```

### 2. Creation Flow
When an intake product is purchased:
1. The webhook handler triggers `generateIntakeToken()`.
2. A random UUID is generated.
3. The record is stored with `expiresAt` set to **7 days** from creation.
4. The token UUID is embedded in the onboarding link sent to the user:
   `https://agency.rihan.cloud/intake/f81d4fae-7dec-11d0-a765-00a0c91e6bf6`

### 3. Expiration & Single-Use Rules
Tokens are checked against two conditions before rendering the questionnaire:
- **`isUsed`**: If the token has already been submitted, it is blocked.
- **`expiresAt`**: If the current date is past `expiresAt`, it is blocked.

When the customer submits the questionnaire form:
- The token state `isUsed` is flipped to `true`.
- The questionnaire payload is processed.
- The token cannot be reused or accessed again.

---

## 🖥️ Dynamic Questionnaire Form UI

The questionnaire is rendered by a hybrid Server/Client component structure at `app/intake/[token]`:
- **Server Wrapper (`page.tsx`)**: Fetches token details, validates status, and handles errors. If valid, it passes configuration down to the client.
- **Client Form (`IntakeForm.tsx`)**: Renders custom Tailwind inputs based on the `productSlug`.

### Dynamic Field Rendering
The form renders fields specifically tailored to the purchased product slug:

#### Infrastructure Audit (`infra-audit`)
- **AWS Account ID**: 12-digit AWS ID.
- **Primary AWS Region**: Dropdown select.
- **Core Workloads**: Textarea details (EC2, ECS, Lambda, EKS, RDS).
- **Current Security Concerns**: Optional security bottlenecks.

#### Automation Specification Document (`automation-spec-doc`)
- **Source Application**: e.g., Whop, Stripe, Typeform.
- **Target Application**: e.g., Notion, ActiveCampaign, Telegram.
- **Trigger Condition**: e.g., payment succeeded, form submitted.
- **Expected Actions**: Specific mapping request details.

#### Managed DevOps (`managed-devops`)
- **Git Provider**: GitHub, GitLab, or Bitbucket.
- **Preferred Cloud Platform**: AWS, GCP, Azure, or Cloudflare.
- **Team Size**: Number of active developers.
- **Infrastructure Goals**: Core migration/modernization objectives.

---

## 📤 Submission & Forwarding (`/api/intake/submit`)

When a user submits their inputs, the client posts the data to [app/api/intake/submit/route.ts](file:///Users/rihan/all-coding-project/techsci-agency-platform/app/api/intake/submit/route.ts).

### Process Flow
1. Next.js validates the input payload using Zod.
2. It fetches the token from the database.
3. If valid, it updates the token status: `isUsed = true`.
4. It compiles a payload merging the **Customer Profile** + **Product Details** + **Form Inputs**.
5. It forwards the payload to **Make.com Scenario A2** (Intake Form Submission Webhook) for queue orchestration.
6. Make.com calls back to the platform's `/api/fulfillment` endpoint to start the automated build.
