# Admin Dashboard & Operations Portal

This document describes the administrative interface, the Notion database integration, passwordless authentication, and operational actions.

---

## 🔑 Passwordless Auth & Proxy Guard

The `/admin` routes are protected against unauthorized access using **NextAuth v5 (Beta)** with a **Resend Magic Link** provider and a proxy guard check.

- **Authentication Config**: Configured in [auth.ts](file:///Users/rihan/all-coding-project/techsci-agency-platform/auth.ts) and [app/api/auth/\[...nextauth\]/route.ts](file:///Users/rihan/all-coding-project/techsci-agency-platform/app/api/auth/%5B...nextauth%5D/route.ts).
- **Proxy Guard**: Located in [proxy.ts](file:///Users/rihan/all-coding-project/techsci-agency-platform/proxy.ts).

### Edge Route Rules
1. Any incoming request targeting paths starting with `/admin` (excluding `/admin/login`) is checked by NextAuth proxy.
2. If no valid session exists, the request is redirected to `/admin/login`.
3. The login page triggers NextAuth to send a secure magic link email using the configured Resend SMTP host.
4. Clicking the magic link logs the administrator in and redirects them back to `/admin`.

---

## 📓 Notion Database Integration

Instead of setting up and hosting an administrative database, the platform leverages **Notion** as both a database and a CRM board.

All Notion operations are defined in [lib/notion/orders.ts](file:///Users/rihan/all-coding-project/techsci-agency-platform/lib/notion/orders.ts).

### Database Properties Schema
The Notion database must have the following column structure:

| Column Name | Property Type | Value Example |
| :--- | :--- | :--- |
| `Event ID` | `Title` (Key) | `evt_3n98ad...` |
| `Product` | `Rich Text` | `infra-audit` |
| `Customer Name` | `Rich Text` | `John Doe` |
| `Customer Email` | `Email` | `john@example.com` |
| `Amount` | `Number` | `14900` (in cents) |
| `Currency` | `Rich Text` | `usd` |
| `Status` | `Select` | `fulfilled`, `awaiting_intake`, `routing_failed` |
| `Created At` | `Date` | `2026-05-20` |

---

## 🖥️ Layout & Metrics Rendering

The dashboard is built using modern dark aesthetics (sleek grays, teals, and subtle borders) and Outfit/Inter typography.

### 1. Operations KPI Calculations
The landing dashboard (`app/admin/page.tsx`) queries the Notion orders database to compute operational metrics in real-time:
- **Total Revenue**: Sums the `Amount` property of all completed/fulfilled purchases.
- **Pending Intakes**: Counts rows with status `awaiting_intake`.
- **Active Subscriptions**: Counts active monthly recurring subscriptions.
- **Completed Deliveries**: Counts rows marked as `fulfilled`.

### 2. Paginated Order Management
Located in [app/admin/orders/page.tsx](file:///Users/rihan/all-coding-project/techsci-agency-platform/app/admin/orders/page.tsx):
- Queries Notion databases using cursor pagination for performance.
- Renders orders in a clean grid list.
- Supports Next.js Server Actions to execute inline edits on order statuses.

---

## ⚡ Server Actions & Campaign Launcher

Operational controls are handled securely using Server Actions:

### 1. Inline Status Updater
Admins can toggle order statuses directly from the order list table. The dropdown triggers an action that maps back to Notion:
```typescript
// app/admin/orders/actions.ts
'use server'

import { updateOrderStatus } from '@/lib/notion/orders'
import { revalidatePath } from 'next/cache'

export async function updateOrderAction(eventId: string, status: any) {
  await updateOrderStatus(eventId, status)
  revalidatePath('/admin/orders')
}
```

### 2. Marketing Campaign Trigger
Located in [app/admin/campaign/page.tsx](file:///Users/rihan/all-coding-project/techsci-agency-platform/app/admin/campaign/page.tsx):
- Integrates with **Make.com Scenario F** (Campaign Trigger Webhook).
- Admins input a **Target Product**, **Launch Type** (e.g. discount, newsletter), and optional **Custom Context**.
- The server action sends a POST request with the campaign details to the Make.com webhook.
- Make.com calls Claude to write contextual email variations and schedule their distribution.
```
