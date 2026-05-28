# Document Fulfillment Engine

Intake submissions produce Claude JSON, render HTML, generate PDF via Doppio, upload to R2, deliver by email.

---

## Claude structured outputs

Sources:

- `lib/claude/audit.ts`
- `lib/claude/spec.ts`

Claude returns strict JSON per schema. No markdown.

---

## HTML templates

Source: `lib/doppio/templates.ts`

- `generateAuditHtml()` for infra audit
- `generateSpecHtml()` for automation spec

Templates include page-break control and severity styling.

---

## PDF compilation (Doppio)

Source: `lib/doppio/pdf.ts`

```ts
POST https://api.doppio.sh/v1/pdf/sync
```

Returns PDF buffer from rendered HTML.

---

## R2 upload + presign

Sources:

- `lib/r2/upload.ts`
- `lib/r2/presign.ts`

Flow:

1. Upload to `deliveries/{eventId}_{productSlug}.pdf`
2. Generate 48h presigned download URL
3. Send via Resend
