import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { PRODUCT_CATALOG, INTAKE_SLUGS, ProductSlug } from '@/lib/products/catalog'
import { generatePresignedUrls } from '@/lib/r2/presign'
import { uploadToR2 } from '@/lib/r2/upload'
import { logOrder, updateOrderStatus } from '@/lib/notion/orders'
import { sendZipDeliveryEmail, sendPdfReportDeliveryEmail, sendWelcomeEmail } from '@/lib/resend/emails'
import { notifyOwner } from '@/lib/telegram/notify'
import { generateAuditReport } from '@/lib/claude/audit'
import { generateAutomationSpec } from '@/lib/claude/spec'
import { generateAuditHtml, generateSpecHtml } from '@/lib/doppio/templates'
import { htmlToPdf } from '@/lib/doppio/pdf'

const PurchaseSchema = z.object({
  eventId: z.string(),
  productSlug: z.string(),
  customerEmail: z.string().email(),
  customerName: z.string(),
  amount: z.number(),
  currency: z.string(),
  isSubscription: z.boolean(),
  intakeToken: z.string().nullable().optional(),
  createdAt: z.string(),
})

const RequestSchema = z.object({
  type: z.enum(['zip', 'intake', 'subscription']),
  purchase: PurchaseSchema,
  formData: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Authenticate internally
  if (req.headers.get('x-internal-api-key') !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid input', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { type, purchase, formData } = parsed.data
  const productSlug = purchase.productSlug as ProductSlug
  const product = PRODUCT_CATALOG[productSlug]

  if (!product) {
    console.error(`[fulfillment] Unsupported product slug: ${productSlug}`)
    await notifyOwner(`⚠️ Fulfillment failed: Unsupported product slug ${productSlug}`)
    return NextResponse.json({ error: 'unsupported_product' }, { status: 400 })
  }

  try {
    // ── 1. ZIP File Delivery ──────────────────────────────────────────────────
    if (type === 'zip') {
      // Create initial order log in Notion
      await logOrder({
        eventId: purchase.eventId,
        productSlug,
        customerEmail: purchase.customerEmail,
        customerName: purchase.customerName,
        amount: purchase.amount,
        currency: purchase.currency,
        status: 'fulfilled',
        createdAt: purchase.createdAt,
      })

      // Generate presigned URLs for assets
      const downloadUrls = await generatePresignedUrls(product.r2Keys as string[])

      // Send ZIP delivery email
      await sendZipDeliveryEmail(
        purchase.customerEmail,
        purchase.customerName,
        product.name,
        downloadUrls,
      )

      await notifyOwner(`📦 Delivered ZIP assets for product <b>${productSlug}</b> to ${purchase.customerEmail}`)
      return NextResponse.json({ success: true, mode: 'zip_delivered' })
    }

    // ── 2. Subscription Welcome (No Intake) ──────────────────────────────────
    if (type === 'subscription' && productSlug === 'community') {
      await logOrder({
        eventId: purchase.eventId,
        productSlug,
        customerEmail: purchase.customerEmail,
        customerName: purchase.customerName,
        amount: purchase.amount,
        currency: purchase.currency,
        status: 'fulfilled',
        createdAt: purchase.createdAt,
      })

      await sendWelcomeEmail(purchase.customerEmail, purchase.customerName)
      await notifyOwner(`⚡ Subscription activated for <b>community</b> for ${purchase.customerEmail}`)
      return NextResponse.json({ success: true, mode: 'subscription_welcomed' })
    }

    // ── 3. Intake Form-Based PDF Fulfillment ─────────────────────────────────
    if (type === 'intake') {
      if (!formData || Object.keys(formData).length === 0) {
        return NextResponse.json({ error: 'formData required for intake type' }, { status: 400 })
      }

      await notifyOwner(`⚙️ Processing intake report generation for <b>${productSlug}</b> (${purchase.customerEmail})...`)

      let htmlContent = ''

      if (productSlug === 'infra-audit') {
        const auditData = await generateAuditReport(formData)
        htmlContent = generateAuditHtml(auditData)
      } else if (productSlug === 'automation-spec-doc') {
        const specData = await generateAutomationSpec(formData)
        htmlContent = generateSpecHtml(specData)
      } else {
        // Fallback or generic template if other intake slugs are added
        htmlContent = `
          <html>
            <body>
              <h1>Intake Submission: ${product.name}</h1>
              <pre>${JSON.stringify(formData, null, 2)}</pre>
            </body>
          </html>
        `
      }

      // Convert HTML string to PDF buffer
      const pdfBuffer = await htmlToPdf(htmlContent)

      // Upload generated PDF to Cloudflare R2
      const r2Key = `deliveries/${purchase.eventId}_${productSlug}.pdf`
      await uploadToR2(pdfBuffer, r2Key)

      // Generate secure 48h download link
      const downloadUrls = await generatePresignedUrls([r2Key])
      const reportDownloadUrl = downloadUrls[0]

      // Update Notion order status to fulfilled
      await updateOrderStatus(purchase.eventId, 'fulfilled')

      // Email PDF to customer
      await sendPdfReportDeliveryEmail(
        purchase.customerEmail,
        purchase.customerName,
        product.name,
        reportDownloadUrl,
      )

      await notifyOwner(`✅ Fully fulfilled intake report for <b>${productSlug}</b> to ${purchase.customerEmail}`)
      return NextResponse.json({ success: true, mode: 'intake_fulfilled', downloadUrl: reportDownloadUrl })
    }

    return NextResponse.json({ error: 'unhandled_fulfillment_type' }, { status: 400 })

  } catch (err) {
    console.error(`[fulfillment] Fatal error on event ${purchase.eventId}`, err)
    
    // Update status to routing_failed in Notion
    try {
      await updateOrderStatus(purchase.eventId, 'routing_failed')
    } catch {
      // ignore
    }

    await notifyOwner(
      `❌ <b>Fulfillment Failed</b>\nEvent ID: <code>${purchase.eventId}</code>\nProduct: <code>${productSlug}</code>\nError: <code>${(err as Error).message}</code>`,
    )

    return NextResponse.json(
      { error: 'fulfillment_failed', details: (err as Error).message },
      { status: 500 },
    )
  }
}
