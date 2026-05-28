# Admin Dashboard

Admin portal for ops, orders, and campaigns. Protected by NextAuth magic link.

---

## Auth

Sources:

- `auth.ts`
- `app/api/auth/[...nextauth]/route.ts`
- `middleware.ts` + `proxy.ts`

Behavior:

- `/admin/*` requires session
- `/admin/login` only public admin page

---

## Notion orders DB

Source: `lib/notion/orders.ts`

Required properties:

- **Event ID** (Title)
- **Product** (Rich Text)
- **Customer Name** (Rich Text)
- **Customer Email** (Email)
- **Amount** (Number, cents)
- **Currency** (Rich Text)
- **Status** (Select: `fulfilled`, `awaiting_intake`, `awaiting_onboarding`, `routing_failed`)
- **Created At** (Date)

---

## Pages

- `/admin` KPI cards + recent orders
- `/admin/orders` paginated Notion table
- `/admin/products` catalog asset checks
- `/admin/campaign` Make.com Scenario F trigger
