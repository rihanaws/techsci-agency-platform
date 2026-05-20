# Document Fulfillment Engine

This document details the pipeline that analyzes intake forms, generates structured PDF reports, and uploads them to object storage.

---

## 🤖 Claude Structured JSON Reports

To guarantee clean data formatting for the PDF generation layer, we configure the Anthropic Claude API to enforce structured JSON outputs utilizing its system prompt directives.

The code is located in [lib/claude/audit.ts](file:///Users/rihan/all-coding-project/techsci-agency-platform/lib/claude/audit.ts) and [lib/claude/spec.ts](file:///Users/rihan/all-coding-project/techsci-agency-platform/lib/claude/spec.ts).

### Prompting Strategy
1. Next.js extracts raw intake form values.
2. It sends the form inputs to Claude Sonnet along with a highly descriptive system role instruction.
3. It directs Claude to output **only valid JSON** containing specific schemas.

#### Sample System Prompt (Infrastructure Security Audit)
```text
You are a senior cloud security auditor. Analyze the provided infrastructure details and generate a comprehensive security audit report.
Your response must be a single, valid JSON object containing:
- executiveSummary (string)
- riskScore (number, 0-100)
- sections (array of findings and recommendations with severity 'low'|'medium'|'high'|'critical')
- roadmap (array of priority remediation actions)
Do not include any explanation or markdown formatting in your response.
```

---

## 🎨 Premium HTML Layout Engines

Once Next.js receives the structured JSON from Claude, it maps the data into premium, print-friendly HTML templates.

The templates are defined in [lib/doppio/templates.ts](file:///Users/rihan/all-coding-project/techsci-agency-platform/lib/doppio/templates.ts).

### Design Architecture
- **Typography**: Imports Google Fonts (Inter) for clean readability.
- **Color System**: Clean, harmonious palettes:
  - Slate and Dark Gray (`#0f172a`, `#1e293b`) for structured text hierarchy.
  - Teal/Aqua accents (`#4f98a3`) for branding headers.
  - Harmonies of warning colors (reds, ambers, blues) corresponding to finding severity classes (`P0`/`P1`/`P2` and `low`/`medium`/`high`/`critical`).
- **Page Break Constraints**: Utilizes inline print rules:
  - `page-break-inside: avoid;` to prevent breaking cards across pages.
  - `page-break-before: always;` to structure multi-page documents (e.g. pushing the remediation roadmap table to Page 2).
  - `-webkit-print-color-adjust: exact;` to preserve background colors during PDF compile.

---

## 📄 Doppio HTML to PDF Compilation

Next.js sends the compiled HTML content to the **Doppio PDF API** for rendering.

The logic is defined in [lib/doppio/pdf.ts](file:///Users/rihan/all-coding-project/techsci-agency-platform/lib/doppio/pdf.ts).

### Execution Flow
1. It sends a POST request containing the raw HTML string to the Doppio compile service:
   `https://api.doppio.sh/v1/render/pdf/sync`
2. The endpoint uses a headless Chromium browser instance to render the HTML.
3. It compiles the page into a high-fidelity PDF document.
4. Next.js receives the PDF back as a direct binary buffer.

---

## 🪣 Cloudflare R2 Upload & Secure Presigning

Once the PDF buffer is received, the platform uploads it to Cloudflare R2 object storage.

The upload and link-generation scripts are located in [lib/r2/upload.ts](file:///Users/rihan/all-coding-project/techsci-agency-platform/lib/r2/upload.ts) and [lib/r2/presign.ts](file:///Users/rihan/all-coding-project/techsci-agency-platform/lib/r2/presign.ts).

### 1. Object Storage Key Naming
Files are organized in R2 by event ID and product slug:
- `deliveries/{purchaseEventId}_{productSlug}.pdf`

### 2. S3 client Setup
The platform initializes a standard `@aws-sdk/client-s3` instance pointed to the Cloudflare endpoint:
```typescript
import { S3Client } from '@aws-sdk/client-s3'

export function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  })
}
```

### 3. Secure 48-Hour Presigned URLs
To prevent unauthorized downloads while avoiding public bucket exposure, download links are generated with an expiration limit of **48 hours (172,800 seconds)**:
```typescript
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function generatePresignedUrls(keys: string[]): Promise<string[]> {
  const client = getR2Client()
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!

  return Promise.all(
    keys.map((key) => {
      const command = new GetObjectCommand({ Bucket: bucketName, Key: key })
      return getSignedUrl(client, command, { expiresIn: 172800 })
    }),
  )
}
```
If a customer attempts to access the URL after 48 hours, Amazon S3 / R2 will reject the request with an XML signature expiration error.
```
